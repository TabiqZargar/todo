window.RT = window.RT || {};
RT.Features = RT.Features || {};

RT.Features.Nav = {
  els: { nav: null, pages: null },

  init() {
    this.els.nav = document.getElementById('sidebar-nav');
    this.els.pages = document.querySelectorAll('.page');
    this.els.nav.addEventListener('click', (e) => {
      const item = e.target.closest('.nav-item');
      if (!item) return;
      const page = item.dataset.page;
      if (page && RT.App) RT.App.navigate(page);
    });
  },

  setActive(page) {
    this.els.nav.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    this.els.pages.forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
  },
};
