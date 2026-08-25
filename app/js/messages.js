/* ========================================
   轻 · 日历 - 文案库
   毒舌 + 鼓励混搭
   ======================================== */

const Messages = (function() {

  // 体重变化文案（下降）
  const weightDown = [
    '轻了一点点，昨天的自律没有白费。别得意，奶茶在前方等着你。',
    '体重下降了，是时候奖励自己一顿…蔬菜沙拉了。',
    '不错不错，继续保持。不过你昨天那口蛋糕我可记着呢。',
    '数字变小了，裤子变松了，人生也轻盈了。',
    '轻了！看来昨晚的宵夜没白…哦不对，你昨晚没吃宵夜。乖。',
    '很好，体重秤上的数字终于学会了往下走。',
    '掉秤了！这就是传说中的「轻」功吗？',
    '体重降了，心情好了，世界都变美好了。别飘，稳住。',
  ];

  // 体重变化文案（上升）
  const weightUp = [
    '重了一点点，昨晚的夜宵好吃吗？',
    '体重上涨，说明你最近过得不错。好是好，就是裤子紧了。',
    '没事，明天少吃一口就回来了。就一口，真的。',
    '涨了涨了，钱包没涨体重先涨了。',
    '体重上升，你这是在为冬天储备能量吗？',
    '又重了？你昨天称的时候是不是偷偷踮脚了？',
    '体重涨了，没关系，反正你的颜值还在。（虽然颜值不能当饭吃）',
    '重了。别慌，可能是水喝多了。嗯，一定是这样。',
  ];

  // 体重变化文案（持平）
  const weightSame = [
    '纹丝不动，稳如泰山。也好，至少没涨。',
    '体重没变化，你的身体在思考人生。',
    '不增不减，不垢不净。佛系体重，佛系人生。',
    '体重没变，说明你处于完美的平衡状态。（可能是吃的和消耗的一样多）',
    '持平。嗯，很稳定。稳定也是一种美德。',
    '今天和昨天一样，没有惊喜也没有惊吓。',
  ];

  // 未记录体重提醒
  const weightReminder = [
    '还没记录今天的体重哦，快去称一称！',
    '体重秤已经等你很久了，它说它想你了。',
    '今天还没上秤呢，勇敢一点，就一下下。',
    '早起第一件事，不是看手机，是称体重。',
    '称一下吧，又不会少块肉。（说不定真的少了）',
    '体重记录这件事，就像刷牙 —— 每天都得做。',
  ];

  // 待办进度文案（低）
  const progressLow = [
    '刚完成一件，热热身呢。',
    '万事开头难，你已经开了头。',
    '千里之行，始于足下。足下已经动了。',
    '已经有一件完成了，不错的开始。剩下的…加油。',
    '一件了一件了，虽然只有一件，但总比零件强。',
  ];

  // 待办进度文案（中）
  const progressMid = [
    '已完成一半，不错的节奏。',
    '进度过半，剩下的一鼓作气？',
    '半数已完成，你比昨天的自己强了一点点。',
    '一半了，中场休息一下？休息完别忘了继续。',
    '50%，还剩一半。我相信你可以的。（真的）',
  ];

  // 待办进度文案（高）
  const progressHigh = [
    '快完成了，胜利就在眼前。',
    '就差几件了，坚持住！',
    '大部分都搞定了，你真棒。棒到可以吃个宵夜…吗？',
    '即将通关，最后几件也拿下！',
    '快做完了，做完就可以躺平了。躺平的感觉你值得拥有。',
  ];

  // 待办进度文案（全部完成）
  const progressDone = [
    '全部完成！今天的你闪闪发光。',
    '清单清空，心情也清爽了。',
    '今日任务全部达成，给自己一个拥抱。',
    '全！部！完！成！你就是最棒的。（今天的）',
    '任务清零，功德圆满。可以去奖励自己了。',
    '完美的一天，从完成所有待办开始。',
  ];

  // 待办进度文案（零任务）
  const progressZero = [
    '还没开始？没关系，随时可以开始。',
    '清单空空，脑袋空空？快加几个任务吧。',
    '待办列表是空的，你今天打算躺平吗？',
    '零任务，零压力。但零压力也等于零成长哦。',
    '空的。你今天没有想做的事吗？哪怕一件小事。',
  ];

  // 完成任务时的小鼓励
  const taskComplete = [
    '干得漂亮！',
    '又消灭了一件！',
    '不错不错。',
    '效率达人。',
    '稳。',
    '这件搞定，下一件继续！',
    '√ 达成',
  ];

  // 随机取一条
  function random(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  // 根据体重变化获取文案
  function getWeightMessage(diff, sarcasmEnabled = true) {
    if (diff > 0) return random(weightUp);
    if (diff < 0) return random(weightDown);
    return random(weightSame);
  }

  // 根据完成率获取待办文案
  function getProgressMessage(total, done) {
    if (total === 0) return random(progressZero);
    if (done === total) return random(progressDone);
    const percent = done / total;
    if (percent >= 0.7) return random(progressHigh);
    if (percent >= 0.4) return random(progressMid);
    return random(progressLow);
  }

  function getWeightReminder() {
    return random(weightReminder);
  }

  function getTaskComplete() {
    return random(taskComplete);
  }

  return {
    getWeightMessage,
    getProgressMessage,
    getWeightReminder,
    getTaskComplete,
  };
})();
