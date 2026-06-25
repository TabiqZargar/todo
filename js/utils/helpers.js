window.RT = window.RT || {};

RT.Helpers = {
  esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  },

  formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString('en', { month: 'short', day: 'numeric' });
  },

  isOverdue(dateStr) {
    if (!dateStr) return false;
    const today = new Date().toISOString().slice(0, 10);
    return dateStr < today;
  },

  pluralize(count, word, suffix = 's') {
    return `${count} ${word}${count !== 1 ? suffix : ''}`;
  },

  getGreeting() {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  },

  todayStr() {
    return new Date().toISOString().slice(0, 10);
  },

  daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  },
};
