window.RT = window.RT || {};
RT.Features = RT.Features || {};

RT.Features.Kanban = {
  render() {
    const statuses = ['backlog', 'in-progress', 'review', 'completed'];

    statuses.forEach(status => {
      const list = document.getElementById(`kanban-${status}`);
      const tasks = RT.TaskService.getList({ status });
      const countEl = document.getElementById(`kanban-count-${status}`);
      if (countEl) countEl.textContent = tasks.length;

      if (tasks.length === 0) {
        list.innerHTML = '<div class="empty-state" style="padding:1rem 0;font-size:0.8rem">No tasks</div>';
      } else {
        list.innerHTML = tasks.map(t => RT.UI.kanbanCard(t)).join('');
      }
    });

    this.wireDragDrop();
  },

  wireDragDrop() {
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
        RT.TaskService.update(dragging.dataset.id, { status: newStatus, done: newStatus === 'completed' });
        this.render();
      });
    });
  },
};
