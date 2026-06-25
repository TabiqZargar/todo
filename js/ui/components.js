window.RT = window.RT || {};

RT.UI = {
  taskItem(task) {
    const dateLabel = RT.Helpers.formatDate(task.dueDate);
    const overdue = RT.Helpers.isOverdue(task.dueDate);
    const tags = (task.tags || []).map(tag => `<span class="task-tag">${RT.Helpers.esc(tag)}</span>`).join('');
    return `
      <div class="task-item" data-id="${task.id}">
        <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''}>
        <div class="task-content">
          <div class="task-text${task.done ? ' completed' : ''}">${RT.Helpers.esc(task.text)}</div>
          <div class="task-meta">
            <span class="task-badge ${task.priority}">${task.priority}</span>
            ${task.category ? `<span class="task-tag">${RT.Helpers.esc(task.category)}</span>` : ''}
            ${tags}
            ${dateLabel ? `<span class="task-due${overdue ? ' overdue' : ''}">${dateLabel}</span>` : ''}
          </div>
        </div>
        <button class="task-delete" title="Delete task">&times;</button>
      </div>
    `;
  },

  deadlineItem(task) {
    const label = RT.Helpers.formatDate(task.dueDate);
    const overdue = RT.Helpers.isOverdue(task.dueDate);
    return `<div class="deadline-item"><span class="deadline-text">${RT.Helpers.esc(task.text)}</span><span class="deadline-date${overdue ? ' overdue' : ''}">${label}</span></div>`;
  },

  kanbanCard(task) {
    const dateLabel = RT.Helpers.formatDate(task.dueDate);
    return `
      <div class="kanban-card" draggable="true" data-id="${task.id}">
        <div class="task-text">${RT.Helpers.esc(task.text)}</div>
        <div class="task-meta">
          <span class="task-badge ${task.priority}">${task.priority}</span>
          ${dateLabel ? `<span class="task-due">${dateLabel}</span>` : ''}
        </div>
      </div>
    `;
  },

  barChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const maxVal = Math.max(1, ...data.map(a => a.completed));
    container.innerHTML = data.map(a => `
      <div class="bar-item">
        <span class="bar-value">${a.completed}</span>
        <div class="bar" style="height:${Math.max(4, (a.completed / maxVal) * 100)}%"></div>
        <span class="bar-label">${a.dayName}</span>
      </div>
    `).join('');
  },

  heatmap(canvasId, weeks = 26, width = 460) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const data = RT.AnalyticsService.getHeatmapData(weeks * 7);
    const ctx = canvas.getContext('2d');
    const cell = 11, gap = 3, rows = 7, cols = weeks;

    canvas.width = Math.max(width, cols * (cell + gap) + gap);
    canvas.height = rows * (cell + gap) + gap;

    ctx.fillStyle = '#0a0a0f';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const maxVal = Math.max(1, ...Object.values(data));
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
};
