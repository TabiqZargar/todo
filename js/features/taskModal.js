window.RT = window.RT || {};
RT.Features = RT.Features || {};

RT.Features.TaskModal = {
  init() {
    const modal = document.getElementById('task-modal');
    document.getElementById('task-modal-close').addEventListener('click', () => this.close());
    document.getElementById('task-modal-cancel').addEventListener('click', () => this.close());
    modal.addEventListener('click', (e) => { if (e.target === modal) this.close(); });
    document.getElementById('task-modal-save').addEventListener('click', () => this.save());
  },

  open(task = null) {
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

    document.getElementById('task-modal').classList.remove('hidden');
    setTimeout(() => document.getElementById('task-form-text').focus(), 100);
  },

  close() {
    document.getElementById('task-modal').classList.add('hidden');
  },

  save() {
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
      RT.TaskService.update(id, data);
    } else {
      RT.TaskService.create(data);
    }

    this.close();
    if (RT.App) RT.App.refreshCurrentPage();
  },
};
