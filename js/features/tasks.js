window.RT = window.RT || {};
RT.Features = RT.Features || {};

RT.Features.Tasks = {
  filter: null,

  init() {
    this.filter = RT.Hooks.useFilter();
    this.initFilters();
    document.getElementById('tasks-add-btn').addEventListener('click', () => RT.Features.TaskModal.open(null));
  },

  initFilters() {
    const search = document.getElementById('tasks-search');
    const priority = document.getElementById('tasks-filter-priority');
    const category = document.getElementById('tasks-filter-category');
    const chips = document.getElementById('tasks-filter-chips');

    search.addEventListener('input', () => {
      this.filter.setSearch(search.value);
      if (RT.App && RT.App.currentPage === 'tasks') this.render();
    });

    priority.addEventListener('change', () => {
      this.filter.setPriority(priority.value);
      if (RT.App && RT.App.currentPage === 'tasks') this.render();
    });

    category.addEventListener('change', () => {
      this.filter.setCategory(category.value);
      if (RT.App && RT.App.currentPage === 'tasks') this.render();
    });

    chips.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip');
      if (!chip) return;
      chips.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      const val = chip.dataset.filterDone;
      this.filter.setDone(val === 'all' ? undefined : val === 'completed');
      if (RT.App && RT.App.currentPage === 'tasks') this.render();
    });
  },

  render() {
    const tasks = this.filter.apply();
    const catSelect = document.getElementById('tasks-filter-category');
    const cats = RT.TaskService.getCategories();
    const currentCat = catSelect.value;
    catSelect.innerHTML = '<option value="">All Categories</option>'
      + cats.map(c => `<option value="${c}"${c === currentCat ? ' selected' : ''}>${c}</option>`).join('');

    const list = document.getElementById('tasks-list');
    if (tasks.length === 0) {
      list.innerHTML = '<div class="empty-state">No tasks match your filters.</div>';
    } else {
      list.innerHTML = tasks.map(t => RT.UI.taskItem(t)).join('');
    }

    const total = RT.TaskService.getAll().length;
    const remaining = RT.TaskService.getAll().filter(t => !t.done).length;
    const showing = tasks.length;
    const el = document.getElementById('tasks-counter');
    el.textContent = showing < total
      ? `Showing ${showing} of ${total} tasks — ${remaining} remaining`
      : `${total} tasks — ${remaining} remaining`;

    this.wireEvents();
  },

  wireEvents() {
    const list = document.getElementById('tasks-list');

    list.querySelectorAll('.task-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        RT.TaskService.update(item.dataset.id, { done: e.target.checked });
        this.render();
      });
    });

    list.querySelectorAll('.task-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        RT.TaskService.remove(item.dataset.id);
        this.render();
      });
    });

    list.querySelectorAll('.task-text').forEach(span => {
      span.addEventListener('dblclick', (e) => {
        const item = e.target.closest('.task-item');
        if (!item) return;
        const task = RT.TaskService.getById(item.dataset.id);
        if (task) RT.Features.TaskModal.open(task);
      });
    });
  },
};
