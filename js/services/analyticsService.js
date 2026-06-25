window.RT = window.RT || {};

RT.AnalyticsService = {
  getCompletionRate() {
    if (RT.Store.data.tasks.length === 0) return 0;
    return Math.round((RT.Store.data.tasks.filter(t => t.done).length / RT.Store.data.tasks.length) * 100);
  },

  getStreak() {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const completed = RT.Store.data.tasks.some(t => {
        if (!t.completedAt) return false;
        return new Date(t.completedAt).toISOString().slice(0, 10) === dateStr;
      });
      if (completed) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }
    return streak;
  },

  getDailyActivity(days = 7) {
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const completed = RT.Store.data.tasks.filter(t => {
        if (!t.completedAt) return false;
        return new Date(t.completedAt).toISOString().slice(0, 10) === dateStr;
      }).length;
      result.push({ date: dateStr, completed, dayName: d.toLocaleDateString('en', { weekday: 'short' }) });
    }
    return result;
  },

  getHeatmapData(days = 182) {
    const map = {};
    const now = new Date();
    for (let i = 0; i < days; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      map[d.toISOString().slice(0, 10)] = 0;
    }
    RT.Store.data.tasks.forEach(t => {
      if (t.completedAt) {
        const dateStr = new Date(t.completedAt).toISOString().slice(0, 10);
        if (map[dateStr] !== undefined) map[dateStr]++;
      }
    });
    return map;
  },

  getWeeklyStats() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const tasks = RT.Store.data.tasks.filter(t => t.createdAt >= startOfWeek.getTime());
    const completed = tasks.filter(t => t.done).length;
    return {
      total: tasks.length,
      completed,
      rate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    };
  },

  getUpcomingDeadlines(limit = 5) {
    return RT.Store.data.tasks
      .filter(t => !t.done && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, limit);
  },

  getTodayTasks() {
    const today = RT.Helpers.todayStr();
    return RT.Store.data.tasks.filter(t => t.dueDate === today);
  },
};
