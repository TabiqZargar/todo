window.RT = window.RT || {};
RT.Features = RT.Features || {};

RT.Features.CommandPalette = {
  commandIndex: 0,
  commands: RT.Constants.COMMANDS,

  init() {
    const overlay = document.getElementById('command-palette');
    const input = document.getElementById('command-input');
    const results = document.getElementById('command-results');

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) this.close();
    });

    input.addEventListener('input', () => this.filter(input.value));
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { this.close(); }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.commandIndex = Math.min(this.commandIndex + 1, results.children.length - 1);
        this.highlight();
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.commandIndex = Math.max(this.commandIndex - 1, 0);
        this.highlight();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const highlighted = results.querySelector('.highlighted');
        if (highlighted) highlighted.click();
      }
    });
  },

  toggle() {
    const overlay = document.getElementById('command-palette');
    overlay.classList.toggle('hidden');
    if (!overlay.classList.contains('hidden')) {
      document.getElementById('command-input').value = '';
      this.commandIndex = 0;
      this.filter('');
      setTimeout(() => document.getElementById('command-input').focus(), 50);
    }
  },

  close() {
    document.getElementById('command-palette').classList.add('hidden');
  },

  filter(query) {
    const q = query.toLowerCase();
    const filtered = this.commands.filter(c => c.name.toLowerCase().includes(q));
    const results = document.getElementById('command-results');
    if (filtered.length === 0) {
      results.innerHTML = '<div class="command-item" style="color:var(--text-muted)">No matching commands</div>';
    } else {
      results.innerHTML = filtered.map((c, i) =>
        `<div class="command-item${i === 0 ? ' highlighted' : ''}" data-cmd-index="${i}">
          <span>${c.name}</span>
          ${c.key ? `<span class="cmd-key">${c.key}</span>` : ''}
        </div>`
      ).join('');
      this.commandIndex = 0;
    }
    results.querySelectorAll('.command-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = parseInt(item.dataset.cmdIndex);
        const cmd = filtered[idx];
        if (cmd) { this.execute(cmd); this.close(); }
      });
    });
  },

  highlight() {
    const results = document.getElementById('command-results');
    results.querySelectorAll('.command-item').forEach((el, i) => el.classList.toggle('highlighted', i === this.commandIndex));
  },

  execute(cmd) {
    switch (cmd.action) {
      case 'navigate dashboard': RT.App.navigate('dashboard'); break;
      case 'navigate tasks': RT.App.navigate('tasks'); break;
      case 'navigate kanban': RT.App.navigate('kanban'); break;
      case 'navigate analytics': RT.App.navigate('analytics'); break;
      case 'navigate focus': RT.App.navigate('focus'); break;
      case 'navigate settings': RT.App.navigate('settings'); break;
      case 'newTask':
        RT.App.navigate('tasks');
        setTimeout(() => RT.Features.TaskModal.open(null), 100);
        break;
      case 'searchTasks':
        RT.App.navigate('tasks');
        setTimeout(() => document.getElementById('tasks-search').focus(), 100);
        break;
      case 'clearCompleted':
        RT.TaskService.getAll().filter(t => t.done).forEach(t => RT.TaskService.remove(t.id));
        RT.App.refreshCurrentPage();
        break;
      case 'startFocus':
        RT.App.navigate('focus');
        setTimeout(() => { if (RT.Features.Focus && RT.Features.Focus.timer) RT.Features.Focus.timer.start(); }, 100);
        break;
      case 'toggleSound':
        RT.Store.data.settings.soundEnabled = !RT.Store.data.settings.soundEnabled;
        RT.Store.save();
        break;
    }
  },
};
