(function() {
  document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-copy-text]');
    if (!btn) return;
    var block = btn.closest('.code-block');
    if (!block) return;
    var code = block.querySelector('.code-block-content code');
    if (!code) return;
    var text = code.textContent || '';
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        var orig = btn.textContent;
        btn.textContent = 'Copied!';
        setTimeout(function() { btn.textContent = orig; }, 2000);
      });
    }
  });
})();
