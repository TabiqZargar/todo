window.RT = window.RT || {};
RT.Features = RT.Features || {};

RT.Features.Analytics = {
  render() {
    const total = RT.TaskService.getAll().length;
    const completed = RT.TaskService.getAll().filter(t => t.done).length;
    const rate = RT.AnalyticsService.getCompletionRate();
    const streak = RT.AnalyticsService.getStreak();
    const focus7d = RT.FocusService.getRecentMinutes(7);

    RT.Helpers.setText('analytics-total', total);
    RT.Helpers.setText('analytics-completed', completed);
    RT.Helpers.setText('analytics-rate', rate + '%');
    RT.Helpers.setText('analytics-streak', streak + ' days');
    RT.Helpers.setText('analytics-focus', focus7d + 'm');

    RT.UI.barChart('weekly-chart', RT.AnalyticsService.getDailyActivity(7));
    RT.UI.heatmap('heatmap-canvas-large', 26, 720);
  },
};
