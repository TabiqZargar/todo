window.RT = window.RT || {};

RT.Store = {
  data: {
    tasks: [],
    focusSessions: [],
    settings: {
      focusDuration: 25,
      breakDuration: 5,
      soundEnabled: true,
    },
  },

  init() {
    this.load();
  },

  load() {
    try {
      const raw = localStorage.getItem(RT.Constants.STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
        if (!this.data.tasks) this.data.tasks = [];
        if (!this.data.focusSessions) this.data.focusSessions = [];
        if (!this.data.settings) this.data.settings = { ...RT.Store.data.settings };
        this.data.tasks = this.data.tasks.map(t => ({
          id: t.id || this.generateId(),
          text: t.text || '',
          description: t.description || '',
          priority: t.priority || 'medium',
          dueDate: t.dueDate || null,
          category: t.category || '',
          tags: t.tags || [],
          done: t.done || false,
          status: t.status || (t.done ? 'completed' : 'backlog'),
          createdAt: t.createdAt || Date.now(),
          completedAt: t.completedAt || null,
          focusTime: t.focusTime || 0,
        }));
      }
    } catch {
      this.data.tasks = [];
    }
  },

  save() {
    localStorage.setItem(RT.Constants.STORAGE_KEY, JSON.stringify(this.data));
  },

  generateId() {
    return 'ts_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  },

  clearAllData() {
    this.data.tasks = [];
    this.data.focusSessions = [];
    this.save();
  },
};
