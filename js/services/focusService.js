window.RT = window.RT || {};

RT.FocusService = {
  addSession(duration, type = 'focus') {
    const session = {
      date: RT.Helpers.todayStr(),
      duration,
      type,
      timestamp: Date.now(),
    };
    if (!RT.Store.data.focusSessions) RT.Store.data.focusSessions = [];
    RT.Store.data.focusSessions.push(session);
    RT.Store.save();
    return session;
  },

  getTodayMinutes() {
    const today = RT.Helpers.todayStr();
    const sessions = RT.Store.data.focusSessions || [];
    return sessions
      .filter(s => s.date === today && s.type === 'focus')
      .reduce((sum, s) => sum + s.duration, 0);
  },

  getRecentMinutes(days = 7) {
    const cutoff = Date.now() - days * 86400000;
    const sessions = RT.Store.data.focusSessions || [];
    return sessions
      .filter(s => s.type === 'focus' && s.timestamp > cutoff)
      .reduce((sum, s) => sum + s.duration, 0);
  },

  getSessionsToday() {
    const today = RT.Helpers.todayStr();
    return (RT.Store.data.focusSessions || []).filter(s => s.date === today && s.type === 'focus');
  },
};
