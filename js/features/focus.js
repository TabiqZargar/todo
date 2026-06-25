window.RT = window.RT || {};
RT.Features = RT.Features || {};

RT.Features.Focus = {
  timer: null,

  init() {
    this.timer = RT.Hooks.useTimer();
    this.updateStats();

    document.getElementById('focus-start-btn').addEventListener('click', () => {
      if (this.timer) this.timer.start();
    });
    document.getElementById('focus-pause-btn').addEventListener('click', () => {
      if (this.timer) this.timer.pause();
    });
    document.getElementById('focus-reset-btn').addEventListener('click', () => {
      if (this.timer) this.timer.reset();
    });

    this.timer.initTimer(RT.Store.data.settings.focusDuration);
  },

  updateStats() {
    const sessions = RT.FocusService.getSessionsToday();
    const totalMin = sessions.reduce((sum, s) => sum + s.duration, 0);
    RT.Helpers.setText('focus-sessions-today', sessions.length);
    RT.Helpers.setText('focus-time-today', totalMin + 'm');
    RT.Helpers.setText('focus-streak', RT.AnalyticsService.getStreak() + ' days');
  },
};
