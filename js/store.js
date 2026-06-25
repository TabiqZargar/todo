const Store = {
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
      const raw = localStorage.getItem('runtime-tasks');
      if (raw) {
        const parsed = JSON.parse(raw);
        this.data = { ...this.data, ...parsed };
        if (!this.data.tasks) this.data.tasks = [];
        if (!this.data.focusSessions) this.data.focusSessions = [];
        if (!this.data.settings) this.data.settings = { ...Store.data.settings };
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
    localStorage.setItem('runtime-tasks', JSON.stringify(this.data));
  },

  generateId() {
    return 'ts_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6);
  },

  addTask(taskData) {
    const task = {
      id: this.generateId(),
      text: '',
      description: '',
      priority: 'medium',
      dueDate: null,
      category: '',
      tags: [],
      done: false,
      status: 'backlog',
      createdAt: Date.now(),
      completedAt: null,
      focusTime: 0,
      ...taskData,
    };
    this.data.tasks.unshift(task);
    this.save();
    return task;
  },

  updateTask(id, updates) {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    const task = this.data.tasks[idx];
    if (updates.done !== undefined && updates.done !== task.done) {
      updates.completedAt = updates.done ? Date.now() : null;
      if (!updates.done && task.status === 'completed') {
        updates.status = 'in-progress';
      }
    }
    Object.assign(task, updates);
    this.save();
    return task;
  },

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.save();
  },

  getTask(id) {
    return this.data.tasks.find(t => t.id === id) || null;
  },

  getTasks(filters = {}) {
    let tasks = [...this.data.tasks];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(t =>
        t.text.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        t.tags.some(tag => tag.toLowerCase().includes(q)) ||
        (t.category || '').toLowerCase().includes(q)
      );
    }
    if (filters.priority) tasks = tasks.filter(t => t.priority === filters.priority);
    if (filters.status) tasks = tasks.filter(t => t.status === filters.status);
    if (filters.category) tasks = tasks.filter(t => (t.category || '') === filters.category);
    if (filters.done !== undefined) tasks = tasks.filter(t => t.done === filters.done);
    if (filters.tag) tasks = tasks.filter(t => t.tags.includes(filters.tag));
    return tasks;
  },

  addFocusSession(duration, type = 'focus') {
    const session = {
      date: new Date().toISOString().slice(0, 10),
      duration,
      type,
      timestamp: Date.now(),
    };
    if (!this.data.focusSessions) this.data.focusSessions = [];
    this.data.focusSessions.push(session);
    this.save();
  },

  getTodayFocusMinutes() {
    const today = new Date().toISOString().slice(0, 10);
    const sessions = this.data.focusSessions || [];
    return sessions
      .filter(s => s.date === today && s.type === 'focus')
      .reduce((sum, s) => sum + s.duration, 0);
  },

  getDailyActivity(days = 7) {
    const result = [];
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const completed = this.data.tasks.filter(t => {
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
      const dateStr = d.toISOString().slice(0, 10);
      map[dateStr] = 0;
    }
    this.data.tasks.forEach(t => {
      if (t.completedAt) {
        const dateStr = new Date(t.completedAt).toISOString().slice(0, 10);
        if (map[dateStr] !== undefined) map[dateStr]++;
      }
    });
    return map;
  },

  getCompletionRate() {
    if (this.data.tasks.length === 0) return 0;
    return Math.round((this.data.tasks.filter(t => t.done).length / this.data.tasks.length) * 100);
  },

  getStreak() {
    let streak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const completed = this.data.tasks.some(t => {
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

  getUpcomingDeadlines(limit = 5) {
    return this.data.tasks
      .filter(t => !t.done && t.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, limit);
  },

  getTodayTasks() {
    const today = new Date().toISOString().slice(0, 10);
    return this.data.tasks.filter(t => {
      if (!t.dueDate) return false;
      return t.dueDate === today;
    });
  },

  getWeeklyStats() {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const tasks = this.data.tasks.filter(t => t.createdAt >= startOfWeek.getTime());
    const completed = tasks.filter(t => t.done).length;
    return {
      total: tasks.length,
      completed,
      rate: tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0,
    };
  },

  getCategories() {
    const cats = new Set();
    this.data.tasks.forEach(t => { if (t.category) cats.add(t.category); });
    return [...cats].sort();
  },

  getAllTags() {
    const tags = new Set();
    this.data.tasks.forEach(t => t.tags.forEach(tag => tags.add(tag)));
    return [...tags].sort();
  },

  getStatusCounts() {
    const counts = { backlog: 0, 'in-progress': 0, review: 0, completed: 0 };
    this.data.tasks.forEach(t => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return counts;
  },

  clearAllData() {
    this.data.tasks = [];
    this.data.focusSessions = [];
    this.save();
  },
};
