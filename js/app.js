window.RT = window.RT || {};

RT.App = {
  currentPage: 'dashboard',

  init() {
    RT.Store.init();
    RT.Hooks.useKeyboard().init();
    RT.Features.Nav.init();
    RT.Features.TaskModal.init();
    RT.Features.CommandPalette.init();
    RT.Features.Tasks.init();
    RT.Features.Focus.init();
    RT.Features.Settings.init();
    this.navigate('dashboard');
  },

  navigate(page) {
    if (this.currentPage === page) {
      this.refreshCurrentPage();
      return;
    }
    this.currentPage = page;
    RT.Features.Nav && RT.Features.Nav.setActive(page);
    switch (page) {
      case 'dashboard': RT.Features.Dashboard.render(); break;
      case 'tasks': RT.Features.Tasks.render(); break;
      case 'kanban': RT.Features.Kanban.render(); break;
      case 'analytics': RT.Features.Analytics.render(); break;
      case 'focus': RT.Features.Focus.updateStats(); break;
      case 'settings': RT.Features.Settings.render(); break;
    }
  },

  refreshCurrentPage() {
    this.navigate(this.currentPage);
  },
};

document.addEventListener('DOMContentLoaded', () => RT.App.init());
