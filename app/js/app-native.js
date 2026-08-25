/* Capacitor 原生功能：返回键处理 */
(function() {
  var Capacitor = window.Capacitor;
  if (!Capacitor || !Capacitor.Plugins || !Capacitor.Plugins.App) return;

  var exitTimer = null;

  function getQueryParam(name) {
    var match = new RegExp('[?&]' + name + '=([^&]+)').exec(window.location.search);
    return match ? match[1] : null;
  }

  Capacitor.Plugins.App.addListener('backButton', function() {
    var from = getQueryParam('from');
    var date = getQueryParam('date');

    if (from) {
      if (from === 'index') {
        location.href = 'index.html';
      } else {
        var url = from + '.html';
        if (date) url += '?date=' + date;
        location.href = url;
      }
      return;
    }

    if (exitTimer) {
      clearTimeout(exitTimer);
      exitTimer = null;
      Capacitor.Plugins.App.exitApp();
    } else {
      showToast('再按一次退出应用');
      exitTimer = setTimeout(function() {
        exitTimer = null;
      }, 2000);
    }
  });

  function showToast(msg) {
    var existing = document.getElementById('nativeToast');
    if (existing) existing.remove();

    var toast = document.createElement('div');
    toast.id = 'nativeToast';
    toast.textContent = msg;
    toast.style.cssText =
      'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%)' +
      ';background:rgba(44,44,44,0.92);color:#fff;padding:12px 28px' +
      ';border-radius:24px;font-size:14px;z-index:9999;pointer-events:none' +
      ';transition:opacity 0.3s;opacity:0;letter-spacing:1px';
    document.body.appendChild(toast);

    requestAnimationFrame(function() {
      toast.style.opacity = '1';
    });

    setTimeout(function() {
      toast.style.opacity = '0';
      setTimeout(function() {
        if (toast.parentNode) toast.remove();
      }, 300);
    }, 1500);
  }
})();
