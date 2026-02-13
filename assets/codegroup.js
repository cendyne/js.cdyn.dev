(function() {
  function bindCodeGroups() {
    var groups = document.querySelectorAll('[data-code-group]:not([data-bound])');
    for (var g = 0; g < groups.length; g++) {
      var group = groups[g];
      group.setAttribute('data-bound', 'true');
      var tabs = group.querySelectorAll('button[data-code-tab]');
      var panels = group.querySelectorAll('[data-code-panel]');
      if (!tabs.length || !panels.length) continue;
      for (var i = 0; i < tabs.length; i++) {
        var selected = (i === 0);
        tabs[i].setAttribute('aria-selected', selected ? 'true' : 'false');
        tabs[i].tabIndex = selected ? 0 : -1;
        var panelId = tabs[i].getAttribute('aria-controls');
        if (panelId) {
          var panel = group.querySelector('#' + CSS.escape(panelId));
          if (panel) {
            if (selected) panel.removeAttribute('hidden');
            else panel.setAttribute('hidden', '');
          }
        }
      }
      for (var j = 0; j < tabs.length; j++) {
        (function(tab) {
          tab.addEventListener('click', function(ev) {
            ev.preventDefault();
            activateTab(group, tab);
          });
          tab.addEventListener('keydown', function(ev) {
            var key = ev.key;
            if (key === 'ArrowRight' || key === 'ArrowLeft') {
              ev.preventDefault();
              var idx = Array.prototype.indexOf.call(tabs, tab);
              var next = idx + (key === 'ArrowRight' ? 1 : -1);
              if (next < 0) next = tabs.length - 1;
              if (next >= tabs.length) next = 0;
              tabs[next].focus();
              activateTab(group, tabs[next]);
            } else if (key === 'Home') {
              ev.preventDefault();
              tabs[0].focus();
              activateTab(group, tabs[0]);
            } else if (key === 'End') {
              ev.preventDefault();
              tabs[tabs.length - 1].focus();
              activateTab(group, tabs[tabs.length - 1]);
            }
          });
        })(tabs[j]);
      }
    }
  }
  function activateTab(group, activeTab) {
    var tabs = group.querySelectorAll('button[data-code-tab]');
    for (var i = 0; i < tabs.length; i++) {
      var isActive = (tabs[i] === activeTab);
      tabs[i].setAttribute('aria-selected', isActive ? 'true' : 'false');
      tabs[i].tabIndex = isActive ? 0 : -1;
      var panelId = tabs[i].getAttribute('aria-controls');
      if (panelId) {
        var panel = group.querySelector('#' + CSS.escape(panelId));
        if (panel) {
          if (isActive) panel.removeAttribute('hidden');
          else panel.setAttribute('hidden', '');
        }
      }
    }
  }
  document.addEventListener('DOMContentLoaded', bindCodeGroups);
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    bindCodeGroups();
  }
})();
