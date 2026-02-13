(function() {
  function copyAndFlash(btn, text) {
    if (!navigator.clipboard) return;
    navigator.clipboard.writeText(text).then(function() {
      var orig = btn.textContent;
      btn.textContent = 'Copied!';
      setTimeout(function() { btn.textContent = orig; }, 2000);
    });
  }
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-copy-text]');
    if (btn) {
      var block = btn.closest('.code-block');
      if (!block) return;
      var code = block.querySelector('.code-block-content code');
      if (!code) return;
      copyAndFlash(btn, code.textContent || '');
      return;
    }
    btn = e.target.closest('[data-copy-group]');
    if (btn) {
      var group = btn.closest('[data-code-group]');
      if (!group) return;
      var panel = group.querySelector('[data-code-panel]:not([hidden])');
      if (!panel) return;
      var code = panel.querySelector('code');
      if (!code) return;
      copyAndFlash(btn, code.textContent || '');
    }
  });
})();
