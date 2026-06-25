window.RT = window.RT || {};
RT.Features = RT.Features || {};

RT.Features.Settings = {
  init() {
    document.getElementById('setting-focus-duration').addEventListener('change', (e) => {
      RT.Store.data.settings.focusDuration = parseInt(e.target.value) || 25;
      RT.Store.save();
      if (RT.Features.Focus && RT.Features.Focus.timer) {
        RT.Features.Focus.timer.syncSettings();
      }
    });

    document.getElementById('setting-break-duration').addEventListener('change', (e) => {
      RT.Store.data.settings.breakDuration = parseInt(e.target.value) || 5;
      RT.Store.save();
    });

    document.getElementById('setting-sound').addEventListener('change', (e) => {
      RT.Store.data.settings.soundEnabled = e.target.checked;
      RT.Store.save();
    });

    document.getElementById('settings-clear-data').addEventListener('click', () => {
      if (confirm('Delete all tasks and history? This cannot be undone.')) {
        RT.Store.clearAllData();
        if (RT.App) RT.App.refreshCurrentPage();
      }
    });
  },

  render() {
    document.getElementById('setting-focus-duration').value = RT.Store.data.settings.focusDuration;
    document.getElementById('setting-break-duration').value = RT.Store.data.settings.breakDuration;
    document.getElementById('setting-sound').checked = RT.Store.data.settings.soundEnabled;
  },
};
