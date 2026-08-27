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

  // 自动检测通道：优先从 APP_CONFIG 读取，其次从 meta 标签读取
  // 仅在用户未手动切换过通道时生效，不影响用户后续手动切换
  (function autoDetectChannel() {
    var detectedChannel = null;
    // 优先从 config.js 读取
    if (window.APP_CONFIG && window.APP_CONFIG.channel) {
      detectedChannel = window.APP_CONFIG.channel;
    }
    // 其次从 meta 标签读取（兼容旧版本）
    if (!detectedChannel) {
      var meta = document.querySelector('meta[name="app-channel"]');
      if (meta && meta.content) {
        detectedChannel = meta.content;
      }
    }
    if (detectedChannel === 'beta' || detectedChannel === 'formal') {
      if (!localStorage.getItem(CHANNEL_KEY)) {
        localStorage.setItem(CHANNEL_KEY, detectedChannel);
        STORAGE_KEY = getStorageKey();
      }
    }
  })();

  // 默认数据结构
  const defaultData = {
    weights: {},        // { "2026-8-24": { value: 62.4, time: "09:00" } }
    tasks: {},          // 【旧字段，兼容保留】每日任务（旧版命名）
    checkins: {},       // { "2026-8-24": [{ id, text, completed, completedAt, order }] } — 每日打卡
    commonTasks: [],      // 【旧字段，兼容保留】常用任务库（旧版命名）
    commonCheckins: [],   // 常用打卡库（用户自定义）
    todos: [],          // [{ id, text, completed, completedAt, order, createdAt }] — 长期待办（全局共用）
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
    version: '1.2.0',
  };

  let cache = null;

  // 数据迁移：旧字段 → 新字段
  function migrateData(data) {
    let changed = false;
    // tasks → checkins 迁移
    if (data.tasks && Object.keys(data.tasks).length > 0 && (!data.checkins || Object.keys(data.checkins).length === 0)) {
      data.checkins = JSON.parse(JSON.stringify(data.tasks));
      changed = true;
    }
    // commonTasks → commonCheckins 迁移
    if (data.commonTasks && data.commonTasks.length > 0 && (!data.commonCheckins || data.commonCheckins.length === 0)) {
      data.commonCheckins = JSON.parse(JSON.stringify(data.commonTasks));
      changed = true;
    }
    // 确保 todos 字段存在
    if (!data.todos) {
      data.todos = [];
      changed = true;
    }
    return changed;
  }

  // 加载数据
  function load() {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        cache = JSON.parse(raw);
        // 数据迁移
        const changed = migrateData(cache);
        // 兼容性处理：确保所有字段存在
        cache = Object.assign({}, defaultData, cache);
        cache.moods = defaultData.moods; // 心情选项始终用内置的
        if (changed) save();
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

  // 保存数据（双写新旧字段，保证兼容旧版本导入）
  function save() {
    if (!cache) return;
    try {
      // 双写：checkins → tasks 也同步写
      if (cache.checkins) cache.tasks = JSON.parse(JSON.stringify(cache.checkins));
      if (cache.commonCheckins) cache.commonTasks = JSON.parse(JSON.stringify(cache.commonCheckins));
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

  // ===== 打卡相关（每日） =====
  function getCheckins(dateStr) {
    load();
    return cache.checkins[dateStr] || [];
  }

  function setCheckins(dateStr, checkins) {
    load();
    cache.checkins[dateStr] = checkins;
    save();
  }

  function addCheckin(dateStr, text) {
    load();
    const checkins = cache.checkins[dateStr] || [];
    const item = {
      id: 'c' + Date.now() + Math.random().toString(36).slice(2, 6),
      text,
      completed: false,
      completedAt: null,
      order: checkins.length,
    };
    checkins.push(item);
    cache.checkins[dateStr] = checkins;
    save();
    return item;
  }

  function updateCheckin(dateStr, itemId, updates) {
    load();
    const checkins = cache.checkins[dateStr] || [];
    const index = checkins.findIndex(t => t.id === itemId);
    if (index !== -1) {
      checkins[index] = { ...checkins[index], ...updates };
      cache.checkins[dateStr] = checkins;
      save();
      return checkins[index];
    }
    return null;
  }

  function deleteCheckin(dateStr, itemId) {
    load();
    const checkins = cache.checkins[dateStr] || [];
    cache.checkins[dateStr] = checkins.filter(t => t.id !== itemId);
    save();
  }

  function completeCheckin(dateStr, itemId) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return updateCheckin(dateStr, itemId, { completed: true, completedAt: time });
  }

  function uncompleteCheckin(dateStr, itemId) {
    return updateCheckin(dateStr, itemId, { completed: false, completedAt: null });
  }

  function reorderCheckins(dateStr, fromIndex, toIndex) {
    load();
    const checkins = cache.checkins[dateStr] || [];
    if (fromIndex < 0 || fromIndex >= checkins.length) return;
    if (toIndex < 0 || toIndex >= checkins.length) return;
    const [moved] = checkins.splice(fromIndex, 1);
    checkins.splice(toIndex, 0, moved);
    checkins.forEach((t, i) => t.order = i);
    cache.checkins[dateStr] = checkins;
    save();
  }

  // ===== 常用打卡 =====
  function getCommonCheckins() {
    load();
    return [...cache.commonCheckins].sort((a, b) => a.order - b.order);
  }

  function addCommonCheckin(text) {
    load();
    const item = {
      id: 'cc' + Date.now(),
      text,
      order: cache.commonCheckins.length,
    };
    cache.commonCheckins.push(item);
    save();
    return item;
  }

  function deleteCommonCheckin(id) {
    load();
    cache.commonCheckins = cache.commonCheckins.filter(t => t.id !== id);
    cache.commonCheckins.forEach((t, i) => t.order = i);
    save();
  }

  function reorderCommonCheckins(fromIndex, toIndex) {
    load();
    const items = cache.commonCheckins;
    if (fromIndex < 0 || fromIndex >= items.length) return;
    if (toIndex < 0 || toIndex >= items.length) return;
    const [moved] = items.splice(fromIndex, 1);
    items.splice(toIndex, 0, moved);
    items.forEach((t, i) => t.order = i);
    save();
  }

  // 批量添加常用打卡到某日
  function addCommonCheckinsToDate(dateStr, itemIds) {
    load();
    const checkins = cache.checkins[dateStr] || [];
    let order = checkins.length;
    itemIds.forEach(id => {
      const common = cache.commonCheckins.find(t => t.id === id);
      if (common) {
        checkins.push({
          id: 'c' + Date.now() + Math.random().toString(36).slice(2, 6),
          text: common.text,
          completed: false,
          completedAt: null,
          order: order++,
        });
      }
    });
    cache.checkins[dateStr] = checkins;
    save();
  }

  // ===== 待办事项（长期，全局共用） =====
  function getTodos() {
    load();
    return [...cache.todos].sort((a, b) => a.order - b.order);
  }

  function addTodo(text) {
    load();
    const item = {
      id: 'td' + Date.now() + Math.random().toString(36).slice(2, 6),
      text,
      completed: false,
      completedAt: null,
      order: cache.todos.length,
      createdAt: dateKey(new Date()),
    };
    cache.todos.push(item);
    save();
    return item;
  }

  function updateTodo(itemId, updates) {
    load();
    const index = cache.todos.findIndex(t => t.id === itemId);
    if (index !== -1) {
      cache.todos[index] = { ...cache.todos[index], ...updates };
      save();
      return cache.todos[index];
    }
    return null;
  }

  function deleteTodo(itemId) {
    load();
    cache.todos = cache.todos.filter(t => t.id !== itemId);
    cache.todos.forEach((t, i) => t.order = i);
    save();
  }

  function completeTodo(itemId) {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return updateTodo(itemId, { completed: true, completedAt: time });
  }

  function uncompleteTodo(itemId) {
    return updateTodo(itemId, { completed: false, completedAt: null });
  }

  function reorderTodos(fromIndex, toIndex) {
    load();
    const todos = cache.todos;
    if (fromIndex < 0 || fromIndex >= todos.length) return;
    if (toIndex < 0 || toIndex >= todos.length) return;
    const [moved] = todos.splice(fromIndex, 1);
    todos.splice(toIndex, 0, moved);
    todos.forEach((t, i) => t.order = i);
    save();
  }

  // ===== 兼容旧函数名（保留一段时间，避免旧代码报错） =====
  function getTasks(dateStr) { return getCheckins(dateStr); }
  function setTasks(dateStr, v) { return setCheckins(dateStr, v); }
  function addTask(dateStr, text) { return addCheckin(dateStr, text); }
  function updateTask(dateStr, id, u) { return updateCheckin(dateStr, id, u); }
  function deleteTask(dateStr, id) { return deleteCheckin(dateStr, id); }
  function completeTask(dateStr, id) { return completeCheckin(dateStr, id); }
  function uncompleteTask(dateStr, id) { return uncompleteCheckin(dateStr, id); }
  function reorderTasks(dateStr, f, t) { return reorderCheckins(dateStr, f, t); }
  function getCommonTasks() { return getCommonCheckins(); }
  function addCommonTask(text) { return addCommonCheckin(text); }
  function deleteCommonTask(id) { return deleteCommonCheckin(id); }
  function reorderCommonTasks(f, t) { return reorderCommonCheckins(f, t); }
  function addCommonTasksToDate(dateStr, ids) { return addCommonCheckinsToDate(dateStr, ids); }

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
    // 打卡（每日）
    getCheckins, setCheckins, addCheckin, updateCheckin, deleteCheckin,
    completeCheckin, uncompleteCheckin, reorderCheckins,
    // 常用打卡
    getCommonCheckins, addCommonCheckin, deleteCommonCheckin,
    reorderCommonCheckins, addCommonCheckinsToDate,
    // 待办事项（长期）
    getTodos, addTodo, updateTodo, deleteTodo,
    completeTodo, uncompleteTodo, reorderTodos,
    // 日笺/心情
    getNote, setNote, deleteNote, getMoods,
    // 设置
    getSettings, updateSetting,
    // 导入导出
    exportData, importData,
    // 工具
    formatTime, getWeekday, isToday, isPast, uid, toast, getQueryParam,
    // 兼容旧函数名
    getTasks, setTasks, addTask, updateTask, deleteTask,
    completeTask, uncompleteTask, reorderTasks,
    getCommonTasks, addCommonTask, deleteCommonTask,
    reorderCommonTasks, addCommonTasksToDate,
  };
})();
