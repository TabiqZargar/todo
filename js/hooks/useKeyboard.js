window.RT = window.RT || {};
RT.Hooks = RT.Hooks || {};

RT.Hooks.useKeyboard = function () {
  function init() {
    document.addEventListener('keydown', (e) => {
      const paletteHidden = document.getElementById('command-palette').classList.contains('hidden');
      const modalHidden = document.getElementById('task-modal').classList.contains('hidden');

      if (e.key === 'Escape') {
        if (!paletteHidden) {
          if (RT.Features && RT.Features.CommandPalette) RT.Features.CommandPalette.close();
          return;
        }
        if (!modalHidden) {
          if (RT.Features && RT.Features.TaskModal) RT.Features.TaskModal.close();
          return;
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (RT.Features && RT.Features.CommandPalette) RT.Features.CommandPalette.toggle();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (RT.App) {
          RT.App.navigate('tasks');
          if (RT.Features && RT.Features.TaskModal) RT.Features.TaskModal.open(null);
        }
      }
    });
  }

  return { init };
};
