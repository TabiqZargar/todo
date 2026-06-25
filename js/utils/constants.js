window.RT = window.RT || {};

RT.Constants = {
  PRIORITIES: ['low', 'medium', 'high', 'critical'],
  STATUSES: ['backlog', 'in-progress', 'review', 'completed'],
  PRIORITY_LABELS: { low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical' },
  STATUS_LABELS: { backlog: 'Backlog', 'in-progress': 'In Progress', review: 'Review', completed: 'Completed' },
  PRIORITY_COLORS: {
    low: { bg: 'rgba(68,136,255,0.15)', text: '#4488ff' },
    medium: { bg: 'rgba(255,170,0,0.15)', text: '#ffaa00' },
    high: { bg: 'rgba(255,102,68,0.15)', text: '#ff6644' },
    critical: { bg: 'rgba(255,34,68,0.15)', text: '#ff2244' },
  },
  STATUS_DOTS: { backlog: '', 'in-progress': '', review: '', completed: '' },

  COMMANDS: [
    { name: 'Go to Dashboard', action: 'navigate dashboard', key: 'g d' },
    { name: 'Go to Tasks', action: 'navigate tasks', key: 'g t' },
    { name: 'Go to Board', action: 'navigate kanban', key: 'g b' },
    { name: 'Go to Analytics', action: 'navigate analytics', key: 'g a' },
    { name: 'Go to Focus', action: 'navigate focus', key: 'g f' },
    { name: 'Go to Settings', action: 'navigate settings', key: 'g s' },
    { name: 'New Task', action: 'newTask', key: 'n' },
    { name: 'Search Tasks...', action: 'searchTasks', key: '/' },
    { name: 'Clear Completed Tasks', action: 'clearCompleted', key: '' },
    { name: 'Start Focus Session', action: 'startFocus', key: '' },
    { name: 'Toggle Sound', action: 'toggleSound', key: '' },
  ],

  STORAGE_KEY: 'runtime-tasks',
};
