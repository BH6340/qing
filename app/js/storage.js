/* ========================================
   轻 · 日历 - 数据存储层
   封装 localStorage 操作
   ======================================== */

const Store = (function() {
  const BASE_STORAGE_KEY = 'qing_data_v1';
  const CHANNEL_KEY = 'qing_channel'; // 存在独立的 key 里，不受通道数据影响

  // 获取当前通道：formal / beta
  function _getChannel() {
    return localStorage.getItem(CHANNEL_KEY) || 'formal';
  }

  // 设置通道（不触发数据迁移，仅切换 key）
  function _setChannel(channel) {
    localStorage.setItem(CHANNEL_KEY, channel);
    cache = null; // 清空缓存，下次 load 时从新 key 加载
  }

  // 获取当前通道的存储 key
  function getStorageKey() {
    const channel = _getChannel();
    return channel === 'beta' ? BASE_STORAGE_KEY + '_beta' : BASE_STORAGE_KEY;
  }

  let STORAGE_KEY = getStorageKey();

  // 默认数据结构
  const defaultData = {
    weights: {},        // { "2026-8-24": { value: 62.4, time: "09:00" } }
    tasks: {},          // { "2026-8-24": [{ id, text, completed, completedAt, order }] }
    commonTasks: [],      // 常用任务库（用户自定义）
    notes: {},         // { "2026-8-24": { text: "...", mood: "calm", time: "21:30" } }
    moods: {           // 心情选项
      calm: { emoji: '😌', name: '平静如水', desc: '没有大起大落，平平淡淡的一天。' },
      happy: { emoji: '😊', name: '心情愉悦', desc: '今天很开心，一切都很顺利。' },
      excited: { emoji: '🤩', name: '元气满满', desc: '充满能量，想做什么都有动力。' },
      tired: { emoji: '😩', name: '有点疲惫', desc: '累了，好好休息一下吧。' },
      sad: { emoji: '😔', name: '有点低落', desc: '没关系，低落也是生活的一部分。' },
      angry: { emoji: '😤', name: '有点烦躁', desc: '深呼吸，一切都会过去的。' },
    },
    settings: {
      sarcasm: true,     // 毒舌模式开关
      unit: 'kg',        // 体重单位
    },
    version: '1.0.0',
  };

  let cache = null;

  // 加载数据
  function load() {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        cache = JSON.parse(raw);
        // 兼容性处理：确保所有字段存在
        cache = Object.assign({}, defaultData, cache);
        cache.moods = defaultData.moods; // 心情选项始终用内置的
      } else {
        cache = JSON.parse(JSON.stringify(defaultData));
        save();
      }
    } catch (e) {
      console.error('数据加载失败:', e);
      cache = JSON.parse(JSON.stringify(defaultData));
    }
    return cache;
  }

  // 保存数据
  function save() {
    if (!cache) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (e) {
      console.error('数据保存失败:', e);
    }
  }

  // 日期格式化 key
  function dateKey(date) {
    const d = date instanceof Date ? date : new Date(date);
    return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
  }

  // ===== 体重相关 =====
  function getWeight(dateStr) {
    load();
    return cache.weights[dateStr] || null;
  }

  function setWeight(dateStr, value, time) {
    load();
    cache.weights[dateStr] = {
      value: parseFloat(value),
      time: time || formatTime(new Date()),
    };
    save();
  }

  function deleteWeight(dateStr) {
    load();
    delete cache.weights[dateStr];
    save();
  }

  // 获取前一天的体重
  function getPrevWeight(dateStr) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return getWeight(dateKey(d));
  }

  // 获取一个月的体重数据
  function getMonthWeights(year, month) {
    load();
    const result = {};
    const prefix = `${year}-${month}-`;
    for (const key in cache.weights) {
      if (key.startsWith(prefix)) {
        result[key] = cache.weights[key];
      }
    }
    return result;
  }

  // ===== 任务相关 =====
  function getTasks(dateStr) {
    load();
    return cache.tasks[dateStr] || [];
  }

  function setTasks(dateStr, tasks) {
    load();
    cache.tasks[dateStr] = tasks;
    save();
  }

  function addTask(dateStr, text) {
    load();
    const tasks = cache.tasks[dateStr] || [];
    const task = {
      id: 't' + Date.now() + Math.random().toString(36).slice(2, 6),
      text,
      completed: false,
      completedAt: null,
      order: tasks.length,
    };
    tasks.push(task);
    cache.tasks[dateStr] = tasks;
    save();
    return task;
  }

  function updateTask(dateStr, taskId, updates) {
    load();
    const tasks = cache.tasks[dateStr] || [];
    const index = tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates };
      cache.tasks[dateStr] = tasks;
      save();
      return tasks[index];
    }
    return null;
  }

  function deleteTask(dateStr, taskId) {
    load();
    const tasks = cache.tasks[dateStr] || [];
    cache.tasks[dateStr] = tasks.filter(t => t.id !== taskId);
    save();
  }

  function completeTask(dateStr, taskId) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return updateTask(dateStr, taskId, { completed: true, completedAt: time });
  }

  function uncompleteTask(dateStr, taskId) {
    return updateTask(dateStr, taskId, { completed: false, completedAt: null });
  }

  function reorderTasks(dateStr, fromIndex, toIndex) {
    load();
    const tasks = cache.tasks[dateStr] || [];
    if (fromIndex < 0 || fromIndex >= tasks.length) return;
    if (toIndex < 0 || toIndex >= tasks.length) return;
    const [moved] = tasks.splice(fromIndex, 1);
    tasks.splice(toIndex, 0, moved);
    // 更新 order
    tasks.forEach((t, i) => t.order = i);
    cache.tasks[dateStr] = tasks;
    save();
  }

  // ===== 常用任务 =====
  function getCommonTasks() {
    load();
    return [...cache.commonTasks].sort((a, b) => a.order - b.order);
  }

  function addCommonTask(text) {
    load();
    const task = {
      id: 'c' + Date.now(),
      text,
      order: cache.commonTasks.length,
    };
    cache.commonTasks.push(task);
    save();
    return task;
  }

  function deleteCommonTask(id) {
    load();
    cache.commonTasks = cache.commonTasks.filter(t => t.id !== id);
    cache.commonTasks.forEach((t, i) => t.order = i);
    save();
  }

  function reorderCommonTasks(fromIndex, toIndex) {
    load();
    const tasks = cache.commonTasks;
    if (fromIndex < 0 || fromIndex >= tasks.length) return;
    if (toIndex < 0 || toIndex >= tasks.length) return;
    const [moved] = tasks.splice(fromIndex, 1);
    tasks.splice(toIndex, 0, moved);
    tasks.forEach((t, i) => t.order = i);
    save();
  }

  // 批量添加常用任务到某日
  function addCommonTasksToDate(dateStr, taskIds) {
    load();
    const tasks = cache.tasks[dateStr] || [];
    let order = tasks.length;
    taskIds.forEach(id => {
      const common = cache.commonTasks.find(t => t.id === id);
      if (common) {
        tasks.push({
          id: 't' + Date.now() + Math.random().toString(36).slice(2, 6),
          text: common.text,
          completed: false,
          completedAt: null,
          order: order++,
        });
      }
    });
    cache.tasks[dateStr] = tasks;
    save();
  }

  // ===== 日笺/心情/随笔 =====
  function getNote(dateStr) {
    load();
    return cache.notes[dateStr] || null;
  }

  function setNote(dateStr, data) {
    load();
    cache.notes[dateStr] = {
      text: data.text || '',
      mood: data.mood || 'calm',
      time: data.time || formatTime(new Date()),
    };
    save();
  }

  function deleteNote(dateStr) {
    load();
    delete cache.notes[dateStr];
    save();
  }

  function getMoods() {
    load();
    return cache.moods;
  }

  // ===== 设置 =====
  function getSettings() {
    load();
    return { ...cache.settings };
  }

  function updateSetting(key, value) {
    load();
    cache.settings[key] = value;
    save();
  }

  // ===== 导入导出 =====
  function exportData() {
    load();
    const data = JSON.parse(JSON.stringify(cache));
    data.exportedAt = new Date().toISOString();
    return JSON.stringify(data, null, 2);
  }

  function importData(jsonStr) {
    try {
      const data = JSON.parse(jsonStr);
      // 基本验证
      if (typeof data !== 'object' || data === null) throw new Error('数据格式错误');
      // 合并数据（保留设置，覆盖数据）
      const settings = cache ? { ...cache.settings } : defaultData.settings;
      cache = Object.assign({}, defaultData, data);
      cache.settings = Object.assign({}, settings, data.settings || {});
      save();
      return true;
    } catch (e) {
      console.error('导入失败:', e);
      return false;
    }
  }

  // 重置所有数据
  function resetAll() {
    cache = JSON.parse(JSON.stringify(defaultData));
    save();
  }

  // 清除缓存并重新从 localStorage 加载（用于 bfcache 恢复 / 通道切换）
  function reload() {
    STORAGE_KEY = getStorageKey();
    cache = null;
    return load();
  }

  // ===== 通道管理 =====
  function getChannel() {
    // 这里重新读一次，确保拿到最新
    return localStorage.getItem(CHANNEL_KEY) || 'formal';
  }

  function switchChannel(channel) {
    _setChannel(channel);
    STORAGE_KEY = getStorageKey();
    cache = null;
    load();
  }

  // 导出指定通道的数据（不切换当前通道）
  function exportChannelData(channel) {
    const key = channel === 'beta' ? BASE_STORAGE_KEY + '_beta' : BASE_STORAGE_KEY;
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    try {
      const data = JSON.parse(raw);
      data.exportedAt = new Date().toISOString();
      data.exportedFromChannel = channel;
      return JSON.stringify(data, null, 2);
    } catch (e) {
      return null;
    }
  }

  // ===== 工具函数 =====
  function formatTime(date) {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  function getWeekday(date) {
    const days = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const d = date instanceof Date ? date : new Date(date);
    return days[d.getDay()];
  }

  function isToday(date) {
    const today = new Date();
    const d = date instanceof Date ? date : new Date(date);
    return today.getFullYear() === d.getFullYear() &&
           today.getMonth() === d.getMonth() &&
           today.getDate() === d.getDate();
  }

  function isPast(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = date instanceof Date ? new Date(date) : new Date(date);
    d.setHours(0, 0, 0, 0);
    return d < today;
  }

  // 生成唯一ID
  function uid(prefix = 'id') {
    return prefix + '_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
  }

  // Toast 提示
  function toast(message, duration = 2000) {
    let el = document.querySelector('.toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => {
      el.classList.remove('show');
    }, duration);
  }

  // URL 参数解析
  function getQueryParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  return {
    // 基础
    load, save, reload, resetAll, dateKey,
    // 通道
    getChannel, switchChannel, exportChannelData,
    // 体重
    getWeight, setWeight, deleteWeight, getPrevWeight, getMonthWeights,
    // 任务
    getTasks, setTasks, addTask, updateTask, deleteTask,
    completeTask, uncompleteTask, reorderTasks,
    // 常用任务
    getCommonTasks, addCommonTask, deleteCommonTask,
    reorderCommonTasks, addCommonTasksToDate,
    // 日笺/心情
    getNote, setNote, deleteNote, getMoods,
    // 设置
    getSettings, updateSetting,
    // 导入导出
    exportData, importData,
    // 工具
    formatTime, getWeekday, isToday, isPast, uid, toast, getQueryParam,
  };
})();
