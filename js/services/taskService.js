window.RT = window.RT || {};

RT.TaskService = {
  create(taskData) {
    const task = {
      id: RT.Store.generateId(),
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
    RT.Store.data.tasks.unshift(task);
    RT.Store.save();
    return task;
  },

  update(id, updates) {
    const idx = RT.Store.data.tasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    const task = RT.Store.data.tasks[idx];
    if (updates.done !== undefined && updates.done !== task.done) {
      updates.completedAt = updates.done ? Date.now() : null;
      if (!updates.done && task.status === 'completed') {
        updates.status = 'in-progress';
      }
    }
    Object.assign(task, updates);
    RT.Store.save();
    return task;
  },

  remove(id) {
    RT.Store.data.tasks = RT.Store.data.tasks.filter(t => t.id !== id);
    RT.Store.save();
  },

  getById(id) {
    return RT.Store.data.tasks.find(t => t.id === id) || null;
  },

  getList(filters = {}) {
    let tasks = [...RT.Store.data.tasks];
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

  getAll() {
    return RT.Store.data.tasks;
  },

  getCategories() {
    const cats = new Set();
    RT.Store.data.tasks.forEach(t => { if (t.category) cats.add(t.category); });
    return [...cats].sort();
  },

  getAllTags() {
    const tags = new Set();
    RT.Store.data.tasks.forEach(t => t.tags.forEach(tag => tags.add(tag)));
    return [...tags].sort();
  },

  getStatusCounts() {
    const counts = { backlog: 0, 'in-progress': 0, review: 0, completed: 0 };
    RT.Store.data.tasks.forEach(t => {
      if (counts[t.status] !== undefined) counts[t.status]++;
    });
    return counts;
  },
};
