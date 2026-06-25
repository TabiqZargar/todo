/* ============================================
   Runtime Tasks - Application Logic
   ============================================ */

const App = {
  /* ---------- State ---------- */
  currentPage: 'dashboard',
  timer: { interval: null, seconds: 0, running: false, phase: 'focus', sessions: 0 },
  commandIndex: 0,

  /* ---------- Init ---------- */
  init() {
    Store.init();
    this.cacheDom();
    this.initNav();
    this.initCommandPalette();
    this.initTaskModal();
    this.initFocusTimer();
    this.initSettings();
    this.initKeyboardShortcuts();
    this.renderPage('dashboard');
  },

  cacheDom() {
    this.els = {
      nav: document.getElementById('sidebar-nav'),
      pages: document.querySelectorAll('.page'),
      sidebar: document.getElementById('sidebar'),
    };
  },

  /* ===== Navigation ===== */
  initNav() {
    this.els.nav.addEventListener('click', (e) => {
      const item = e.target.closest('.nav-item');
      if (!item) return;
      const page = item.dataset.page;
      if (page) this.renderPage(page);
    });
  },

  renderPage(page) {
    this.currentPage = page;
    this.els.nav.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    this.els.pages.forEach(p => p.classList.toggle('active', p.id === `page-${page}`));
    switch (page) {
      case 'dashboard': this.renderDashboard(); break;
      case 'tasks': this.renderTasks(); break;
      case 'kanban': this.renderKanban(); break;
      case 'analytics': this.renderAnalytics(); break;
      case 'focus': break; /* timer renders itself */
      case 'settings': this.renderSettings(); break;
    }
  },

  navigate(page) {
    this.renderPage(page);
  },

  /* ===== Dashboard ===== */
  renderDashboard() {
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    const today = Store.getTodayTasks();
    setText('dash-today-count', today.filter(t => !t.done).length);

    const prod = Store.getCompletionRate();
    setText('dash-productivity', prod + '%');

    const streak = Store.getStreak();
    setText('dash-streak', streak);

    const focus = Store.getTodayFocusMinutes();
    setText('dash-focus-time', focus + 'm');

    /* Greeting */
    const hour = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    setText('dashboard-greeting', greet + ', developer.');

    /* Deadlines */
    const deadlines = Store.getUpcomingDeadlines(5);
    const container = document.getElementById('dash-deadlines');
    if (deadlines.length === 0) {
      container.innerHTML = '<div class="empty-state">No upcoming deadlines</div>';
    } else {
      container.innerHTML = deadlines.map(t => {
        const d = t.dueDate ? new Date(t.dueDate + 'T00:00:00') : null;
        const label = d ? d.toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '';
        const overdue = d && d < new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
        return `<div class="deadline-item"><span class="deadline-text">${this.esc(t.text)}</span><span class="deadline-date${overdue ? ' overdue' : ''}">${label}</span></div>`;
      }).join('');
    }

    /* Heatmap */
    this.drawHeatmap('heatmap-canvas', 26, 460);
  },

  /* ===== Heatmap ===== */
  drawHeatmap(canvasId, weeks = 26, width = 460) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const data = Store.getHeatmapData(weeks * 7);
    const ctx = canvas.getContext('2d');
    const cell = 11, gap = 3;
    const rows = 7;
    const cols = weeks;

    canvas.width = Math.max(width, cols * (cell + gap) + gap);
    canvas.height = rows * (cell + gap) + gap;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const maxVal = Math.max(1, ...Object.values(data));

    /* Build date list (oldest to newest) */
    const dates = [];
    const now = new Date();
    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }

    dates.forEach((dateStr, idx) => {
      const col = Math.floor(idx / 7);
      const row = idx % 7;
      const x = gap + col * (cell + gap);
      const y = gap + row * (cell + gap);
      const count = data[dateStr] || 0;
      const intensity = count / maxVal;
      let color;
      if (count === 0) color = '#16161f';
      else if (intensity < 0.25) color = '#1a3a2a';
      else if (intensity < 0.5) color = '#1a5a3a';
      else if (intensity < 0.75) color = '#0a8a4a';
      else color = '#00ff88';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, cell, cell, 2);
      ctx.fill();
    });
  },

  /* ===== Tasks ===== */
  tasksFilterState: { search: '', priority: '', category: '', done: undefined },

  renderTasks() {
    const filters = this.tasksFilterState;
    const tasks = Store.getTasks({
      search: filters.search,
      priority: filters.priority,
      category: filters.category,
      done: filters.done,
    });

    /* Populate category filter */
    const catSelect = document.getElementById('tasks-filter-category');
    const cats = Store.getCategories();
    const currentCat = catSelect.value;
    catSelect.innerHTML = '<option value="">All Categories</option>' + cats.map(c => `<option value="${c}"${c === currentCat ? ' selected' : ''}>${c}</option>`).join('');

    /* Render list */
    const list = document.getElementById('tasks-list');
    if (tasks.length === 0) {
      list.innerHTML = '<div class="empty-state">No tasks match your filters.</div>';
    } else {
      list.innerHTML = tasks.map(t => this.buildTaskHTML(t)).join('');
    }

    /* Counter */
    const total = Store.data.tasks.length;
    const remaining = Store.data.tasks.filter(t => !t.done).length;
    const showing = tasks.length;
    const el = document.getElementById('tasks-counter');
    el.textContent = showing < total ? `Showing ${showing} of ${total} tasks — ${remaining} remaining` : `${total} tasks — ${remaining} remaining`;

    /* Wire events */
    this.wireTaskEvents();
  },

  buildTaskHTML(t) {
    const d = t.dueDate ? new Date(t.dueDate + 'T00:00:00') : null;
    const dateLabel = d ? d.toLocaleDateString('en', { month: 'short', day: 'numeric' }) : '';
    const overdue = d && d < new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
    const tags = (t.tags || []).map(tag => `<span class="task-tag">${this.esc(tag)}</span>`).join('');
    return `
      <div class="task-item" data-id="${t.id}">
        <input type="checkbox" class="task-checkbox" ${t.done ? 'checked' : ''}>
        <div class="task-content">
          <div class="task-text${t.done ? ' completed' : ''}">${this.esc(t.text)}</div>
          <div class="task-meta">
            <span class="task-badge ${t.priority}">${t.priority}</span>
            ${t.category ? `<span class="task-tag">${this.esc(t.category)}</span>` : ''}
            ${tags}
            ${dateLabel ? `<span class="task-due${overdue ? ' overdue' : ''}">${dateLabel}</span>` : ''}
          </div>
        </div>
        <button class="task-delete" title="Delete task">&times;</button>
      </div>
    `;
  },

  wireTaskEvents() {
    const list = document.getElementById('tasks-list');

    /* Toggle completion */
    list.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        Store.updateTask(item.dataset.id, { done: e.target.checked });
        this.renderTasks();
      });
    });

    /* Delete */
    list.querySelectorAll('.task-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        Store.deleteTask(item.dataset.id);
        this.renderTasks();
      });
    });

    /* Double-click to edit */
    list.querySelectorAll('.task-text').forEach(span => {
      span.addEventListener('dblclick', (e) => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        const task = Store.getTask(item.dataset.id);
        if (task) this.openTaskModal(task);
      });
    });
  },

  /* Search & filter events (set up once) */
  initTaskFilters() {
    const search = document.getElementById('tasks-search');
    const priority = document.getElementById('tasks-filter-priority');
    const category = document.getElementById('tasks-filter-category');
    const chips = document.getElementById('tasks-filter-chips');

    search.addEventListener('input', () => {
      this.tasksFilterState.search = search.value;
      if (this.currentPage === 'tasks') this.renderTasks();
    });

    priority.addEventListener('change', () => {
      this.tasksFilterState.priority = priority.value;
      if (this.currentPage === 'tasks') this.renderTasks();
    });

    category.addEventListener('change', () => {
      this.tasksFilterState.category = category.value;
      if (this.currentPage === 'tasks') this.renderTasks();
    });

    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      chips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = chip.dataset.filterDone;
      this.tasksFilterState.done = val === 'all' ? undefined : val === 'completed';
      if (this.currentPage === 'tasks') this.renderTasks();
    });

    /* Add task button */
    document.getElementById('tasks-add-btn').addEventListener('click', () => this.openTaskModal(null));
  },

  /* ===== Kanban ===== */
  renderKanban() {
    const statuses = ['backlog', 'in-progress', 'review', 'completed'];
    const labels = { backlog: 'Backlog', 'in-progress': 'In Progress', review: 'Review', completed: 'Completed' };

    statuses.forEach(status => {
      const list = document.getElementById(`kanban-${status}`);
      const tasks = Store.getTasks({ status });
      const countEl = document.getElementById(`kanban-count-${status}`);
      if (countEl) countEl.textContent = tasks.length;

      if (tasks.length === 0) {
        list.innerHTML = `<div class="empty-state" style="padding:1rem 0;font-size:0.8rem">No tasks</div>`;
      } else {
        list.innerHTML = tasks.map(t => `
          <div class="kanban-card" draggable="true" data-id="${t.id}">
            <div class="task-text">${this.esc(t.text)}</div>
            <div class="task-meta">
              <span class="task-badge ${t.priority}">${t.priority}</span>
              ${t.dueDate ? `<span class="task-due">${new Date(t.dueDate + 'T00:00:00').toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>` : ''}
            </div>
          </div>
        `).join('');
      }
    });

    this.wireKanbanDragDrop();
  },

  wireKanbanDragDrop() {
    document.querySelectorAll('.kanban-card').forEach(card => {
      card.addEventListener('dragstart', () => {
        card.classList.add('dragging');
        card.style.opacity = '0.4';
      });
      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
        card.style.opacity = '1';
        document.querySelectorAll('.kanban-column').forEach(c => c.classList.remove('drag-over'));
      });
    });

    document.querySelectorAll('.kanban-list').forEach(list => {
      list.addEventListener('dragover', (e) => {
        e.preventDefault();
        list.closest('.kanban-column').classList.add('drag-over');
      });
      list.addEventListener('dragleave', () => {
        list.closest('.kanban-column').classList.remove('drag-over');
      });
      list.addEventListener('drop', (e) => {
        e.preventDefault();
        const col = list.closest('.kanban-column');
        col.classList.remove('drag-over');
        const dragging = document.querySelector('.kanban-card.dragging');
        if (!dragging) return;
        const newStatus = col.dataset.status;
        Store.updateTask(dragging.dataset.id, { status: newStatus, done: newStatus === 'completed' });
        this.renderKanban();
      });
    });
  },

  /* ===== Analytics ===== */
  renderAnalytics() {
    const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

    const total = Store.data.tasks.length;
    const completed = Store.data.tasks.filter(t => t.done).length;
    const rate = Store.getCompletionRate();
    const streak = Store.getStreak();
    const focus7d = (Store.data.focusSessions || [])
      .filter(s => s.type === 'focus' && s.timestamp > Date.now() - 7 * 86400000)
      .reduce((s, x) => s + x.duration, 0);

    setText('analytics-total', total);
    setText('analytics-completed', completed);
    setText('analytics-rate', rate + '%');
    setText('analytics-streak', streak + ' days');
    setText('analytics-focus', focus7d + 'm');

    this.renderWeeklyChart();
    this.drawHeatmap('heatmap-canvas-large', 26, 720);
  },

  renderWeeklyChart() {
    const activity = Store.getDailyActivity(7);
    const container = document.getElementById('weekly-chart');
    const maxVal = Math.max(1, ...activity.map(a => a.completed));
    container.innerHTML = activity.map(a => `
      <div class="bar-item">
        <span class="bar-value">${a.completed}</span>
        <div class="bar" style="height:${Math.max(4, (a.completed / maxVal) * 100)}%"></div>
        <span class="bar-label">${a.dayName}</span>
      </div>
    `).join('');
  },

  /* ===== Focus Timer ===== */
  initFocusTimer() {
    this.timer.seconds = Store.data.settings.focusDuration * 60;
    this.updateTimerDisplay();

    document.getElementById('focus-start-btn').addEventListener('click', () => this.startTimer());
    document.getElementById('focus-pause-btn').addEventListener('click', () => this.pauseTimer());
    document.getElementById('focus-reset-btn').addEventListener('click', () => this.resetTimer());
  },

  updateTimerDisplay() {
    const m = Math.floor(this.timer.seconds / 60);
    const s = this.timer.seconds % 60;
    document.getElementById('timer-display').textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    const phaseEl = document.getElementById('timer-phase');
    phaseEl.textContent = this.timer.phase.toUpperCase();
    phaseEl.style.color = this.timer.phase === 'focus' ? 'var(--accent-green)' : 'var(--accent-blue)';
  },

  startTimer() {
    if (this.timer.running) return;
    this.timer.running = true;
    document.getElementById('focus-start-btn').disabled = true;
    document.getElementById('focus-pause-btn').disabled = false;
    this.timer.interval = setInterval(() => {
      this.timer.seconds--;
      this.updateTimerDisplay();
      if (this.timer.seconds <= 0) {
        this.completeTimerPhase();
      }
    }, 1000);
  },

  pauseTimer() {
    this.timer.running = false;
    clearInterval(this.timer.interval);
    document.getElementById('focus-start-btn').disabled = false;
    document.getElementById('focus-start-btn').textContent = 'Resume';
    document.getElementById('focus-pause-btn').disabled = true;
  },

  resetTimer() {
    this.timer.running = false;
    clearInterval(this.timer.interval);
    this.timer.phase = 'focus';
    this.timer.seconds = Store.data.settings.focusDuration * 60;
    this.updateTimerDisplay();
    document.getElementById('focus-start-btn').disabled = false;
    document.getElementById('focus-start-btn').textContent = 'Start';
    document.getElementById('focus-pause-btn').disabled = true;
  },

  completeTimerPhase() {
    clearInterval(this.timer.interval);
    this.timer.running = false;
    document.getElementById('focus-start-btn').disabled = false;
    document.getElementById('focus-pause-btn').disabled = true;

    if (this.timer.phase === 'focus') {
      const duration = Store.data.settings.focusDuration;
      Store.addFocusSession(duration, 'focus');
      this.timer.sessions++;
      this.timer.phase = 'break';
      this.timer.seconds = Store.data.settings.breakDuration * 60;

      /* Update focus stats */
      this.updateFocusStats();

      /* Notification */
      if (Store.data.settings.soundEnabled) {
        try { new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACAf39/f4CAgH9/f3+AgIB/f39/gICAf39/f4CAgI=').play(); } catch {}
      }
    } else {
      this.timer.phase = 'focus';
      this.timer.seconds = Store.data.settings.focusDuration * 60;
    }

    document.getElementById('focus-start-btn').textContent = 'Start';
    this.updateTimerDisplay();
  },

  updateFocusStats() {
    const today = new Date().toISOString().slice(0, 10);
    const sessions = (Store.data.focusSessions || []).filter(s => s.date === today && s.type === 'focus');
    const totalMin = sessions.reduce((sum, s) => sum + s.duration, 0);
    document.getElementById('focus-sessions-today').textContent = sessions.length;
    document.getElementById('focus-time-today').textContent = totalMin + 'm';
    document.getElementById('focus-streak').textContent = Store.getStreak() + ' days';
  },

  /* ===== Settings ===== */
  initSettings() {
    document.getElementById('setting-focus-duration').addEventListener('change', (e) => {
      Store.data.settings.focusDuration = parseInt(e.target.value) || 25;
      Store.save();
      if (this.timer.phase === 'focus' && !this.timer.running) {
        this.timer.seconds = Store.data.settings.focusDuration * 60;
        this.updateTimerDisplay();
      }
    });
    document.getElementById('setting-break-duration').addEventListener('change', (e) => {
      Store.data.settings.breakDuration = parseInt(e.target.value) || 5;
      Store.save();
    });
    document.getElementById('setting-sound').addEventListener('change', (e) => {
      Store.data.settings.soundEnabled = e.target.checked;
      Store.save();
    });
    document.getElementById('settings-clear-data').addEventListener('click', () => {
      if (confirm('Delete all tasks and history? This cannot be undone.')) {
        Store.clearAllData();
        this.renderPage(this.currentPage);
      }
    });
  },

  renderSettings() {
    document.getElementById('setting-focus-duration').value = Store.data.settings.focusDuration;
    document.getElementById('setting-break-duration').value = Store.data.settings.breakDuration;
    document.getElementById('setting-sound').checked = Store.data.settings.soundEnabled;
  },

  /* ===== Task Modal ===== */
  initTaskModal() {
    const modal = document.getElementById('task-modal');
    document.getElementById('task-modal-close').addEventListener('click', () => this.closeTaskModal());
    document.getElementById('task-modal-cancel').addEventListener('click', () => this.closeTaskModal());
    modal.addEventListener('click', (e) => { if (e.target === modal) this.closeTaskModal(); });
    document.getElementById('task-modal-save').addEventListener('click', () => this.saveTaskModal());
  },

  openTaskModal(task = null) {
    const modal = document.getElementById('task-modal');
    const idField = document.getElementById('task-modal-id');
    const titleEl = document.getElementById('task-modal-title');

    if (task) {
      titleEl.textContent = 'Edit Task';
      idField.value = task.id;
      document.getElementById('task-form-text').value = task.text;
      document.getElementById('task-form-desc').value = task.description || '';
      document.getElementById('task-form-priority').value = task.priority;
      document.getElementById('task-form-status').value = task.status;
      document.getElementById('task-form-date').value = task.dueDate || '';
      document.getElementById('task-form-category').value = task.category || '';
      document.getElementById('task-form-tags').value = (task.tags || []).join(', ');
    } else {
      titleEl.textContent = 'New Task';
      idField.value = '';
      document.getElementById('task-form-text').value = '';
      document.getElementById('task-form-desc').value = '';
      document.getElementById('task-form-priority').value = 'medium';
      document.getElementById('task-form-status').value = 'backlog';
      document.getElementById('task-form-date').value = '';
      document.getElementById('task-form-category').value = '';
      document.getElementById('task-form-tags').value = '';
    }

    modal.classList.remove('hidden');
    setTimeout(() => document.getElementById('task-form-text').focus(), 100);
  },

  closeTaskModal() {
    document.getElementById('task-modal').classList.add('hidden');
  },

  saveTaskModal() {
    const id = document.getElementById('task-modal-id').value;
    const text = document.getElementById('task-form-text').value.trim();
    if (!text) return;

    const data = {
      text,
      description: document.getElementById('task-form-desc').value.trim(),
      priority: document.getElementById('task-form-priority').value,
      status: document.getElementById('task-form-status').value,
      dueDate: document.getElementById('task-form-date').value || null,
      category: document.getElementById('task-form-category').value.trim(),
      tags: document.getElementById('task-form-tags').value.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (data.status === 'completed') data.done = true;

    if (id) {
      Store.updateTask(id, data);
    } else {
      Store.addTask(data);
    }

    this.closeTaskModal();
    if (this.currentPage === 'tasks') this.renderTasks();
    if (this.currentPage === 'kanban') this.renderKanban();
    if (this.currentPage === 'dashboard') this.renderDashboard();
    if (this.currentPage === 'analytics') this.renderAnalytics();
  },

  /* ===== Command Palette ===== */
  commands: [
    { name: 'Go to Dashboard', action: () => App.navigate('dashboard'), key: 'g d' },
    { name: 'Go to Tasks', action: () => App.navigate('tasks'), key: 'g t' },
    { name: 'Go to Board', action: () => App.navigate('kanban'), key: 'g b' },
    { name: 'Go to Analytics', action: () => App.navigate('analytics'), key: 'g a' },
    { name: 'Go to Focus', action: () => App.navigate('focus'), key: 'g f' },
    { name: 'Go to Settings', action: () => App.navigate('settings'), key: 'g s' },
    { name: 'New Task', action: () => { App.navigate('tasks'); App.openTaskModal(null); }, key: 'n' },
    { name: 'Search Tasks...', action: () => { App.navigate('tasks'); setTimeout(() => document.getElementById('tasks-search').focus(), 100); }, key: '/' },
    { name: 'Clear Completed Tasks', action: () => { Store.data.tasks = Store.data.tasks.filter(t => !t.done); Store.save(); App.renderPage(App.currentPage); }, key: '' },
    { name: 'Start Focus Session', action: () => { App.navigate('focus'); App.startTimer(); }, key: '' },
    { name: 'Toggle Sound', action: () => { Store.data.settings.soundEnabled = !Store.data.settings.soundEnabled; Store.save(); }, key: '' },
  ],

  initCommandPalette() {
    const overlay = document.getElementById('command-palette');
    const input = document.getElementById('command-input');
    const results = document.getElementById('command-results');

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.toggleCommandPalette();
      }
    });

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.closeCommandPalette();
    });

    input.addEventListener('input', () => this.filterCommands(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { this.closeCommandPalette(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); this.commandIndex = Math.min(this.commandIndex + 1, results.children.length - 1); this.highlightCommand(); }
      if (e.key === 'ArrowUp') { e.preventDefault(); this.commandIndex = Math.max(this.commandIndex - 1, 0); this.highlightCommand(); }
      if (e.key === 'Enter') {
        e.preventDefault();
        const highlighted = results.querySelector('.highlighted');
        if (highlighted) highlighted.click();
      }
    });
  },

  toggleCommandPalette() {
    const overlay = document.getElementById('command-palette');
    overlay.classList.toggle('hidden');
    if (!overlay.classList.contains('hidden')) {
      document.getElementById('command-input').value = '';
      this.commandIndex = 0;
      this.filterCommands('');
      setTimeout(() => document.getElementById('command-input').focus(), 50);
    }
  },

  closeCommandPalette() {
    document.getElementById('command-palette').classList.add('hidden');
  },

  filterCommands(query) {
    const q = query.toLowerCase();
    const filtered = this.commands.filter(c => c.name.toLowerCase().includes(q));
    const results = document.getElementById('command-results');
    if (filtered.length === 0) {
      results.innerHTML = '<div class="command-item" style="color:var(--text-muted)">No matching commands</div>';
    } else {
      results.innerHTML = filtered.map((c, i) =>
        `<div class="command-item${i === 0 ? ' highlighted' : ''}" data-cmd="${c.name}">
          <span>${c.name}</span>
          ${c.key ? `<span class="cmd-key">${c.key}</span>` : ''}
        </div>`
      ).join('');
      this.commandIndex = 0;
    }
    results.querySelectorAll('.command-item').forEach(item => {
      item.addEventListener('click', () => {
        const cmd = this.commands.find(c => c.name === item.dataset.cmd);
        if (cmd) { cmd.action(); this.closeCommandPalette(); }
      });
    });
  },

  highlightCommand() {
    const results = document.getElementById('command-results');
    results.querySelectorAll('.command-item').forEach((el, i) => el.classList.toggle('highlighted', i === this.commandIndex));
  },

  /* ===== Keyboard Shortcuts ===== */
  initKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      /* Escape closes modals */
      if (e.key === 'Escape') {
        if (!document.getElementById('command-palette').classList.contains('hidden')) {
          this.closeCommandPalette();
          return;
        }
        if (!document.getElementById('task-modal').classList.contains('hidden')) {
          this.closeTaskModal();
          return;
        }
      }

      /* Ctrl+N: new task */
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        this.navigate('tasks');
        this.openTaskModal(null);
      }
    });
  },

  /* ===== Utility ===== */
  esc(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },
};

/* ===== Boot ===== */
document.addEventListener('DOMContentLoaded', () => {
  App.init();

  /* Init task filters once (since they're persistent) */
  App.initTaskFilters();

  /* Update focus stats on page focus */
  App.updateFocusStats();
});
