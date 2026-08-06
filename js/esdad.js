(function () {
  "use strict";

  var tabs = Array.from(document.querySelectorAll(".esdad-tab"));
  var panels = Array.from(document.querySelectorAll(".esdad-panel"));
  var panelsWrap = document.querySelector(".esdad-panels");

  function activate(name) {
    tabs.forEach(function (tab) {
      var active = tab.dataset.tab === name;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });
    panels.forEach(function (panel) {
      panel.classList.toggle("is-active", panel.dataset.panel === name);
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      activate(tab.dataset.tab);
    });
  });

  function currentIndex() {
    return tabs.findIndex(function (tab) {
      return tab.classList.contains("is-active");
    });
  }

  function goTo(delta) {
    var i = currentIndex();
    var next = i + delta;
    if (next < 0) next = tabs.length - 1;
    if (next >= tabs.length) next = 0;
    activate(tabs[next].dataset.tab);
  }

  var touchStartX = null;
  var touchStartY = null;

  panelsWrap.addEventListener(
    "touchstart",
    function (e) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    },
    { passive: true }
  );

  panelsWrap.addEventListener(
    "touchend",
    function (e) {
      if (touchStartX === null) return;
      var dx = e.changedTouches[0].clientX - touchStartX;
      var dy = e.changedTouches[0].clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;

      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      goTo(dx < 0 ? 1 : -1);
    },
    { passive: true }
  );
})();
