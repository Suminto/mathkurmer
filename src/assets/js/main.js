(function () {
  var toggle = document.getElementById('menuToggle');
  var sidebar = document.getElementById('sidebar');
  var overlay = document.getElementById('overlay');

  function closeMenu() {
    sidebar.classList.remove('is-open');
    overlay.classList.remove('is-visible');
  }

  function openMenu() {
    sidebar.classList.add('is-open');
    overlay.classList.add('is-visible');
  }

  if (toggle && sidebar && overlay) {
    toggle.addEventListener('click', function () {
      if (sidebar.classList.contains('is-open')) {
        closeMenu();
      } else {
        openMenu();
      }
    });
    overlay.addEventListener('click', closeMenu);
  }
})();
