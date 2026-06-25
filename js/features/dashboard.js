window.RT = window.RT || {};
RT.Features = RT.Features || {};

RT.Features.Dashboard = {
  render() {
    const today = RT.AnalyticsService.getTodayTasks();
    RT.Helpers.setText('dash-today-count', today.filter(t => !t.done).length);
    RT.Helpers.setText('dash-productivity', RT.AnalyticsService.getCompletionRate() + '%');
    RT.Helpers.setText('dash-streak', RT.AnalyticsService.getStreak());
    RT.Helpers.setText('dash-focus-time', RT.FocusService.getTodayMinutes() + 'm');
    RT.Helpers.setText('dashboard-greeting', RT.Helpers.getGreeting() + ', developer.');

    const deadlines = RT.AnalyticsService.getUpcomingDeadlines(5);
    const container = document.getElementById('dash-deadlines');
    if (deadlines.length === 0) {
      container.innerHTML = '<div class="empty-state">No upcoming deadlines</div>';
    } else {
      container.innerHTML = deadlines.map(t => RT.UI.deadlineItem(t)).join('');
    }

    RT.UI.heatmap('heatmap-canvas', 26, 460);
  },
};
