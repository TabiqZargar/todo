window.RT = window.RT || {};

RT.UI = {
  taskItem(task) {
    const dateLabel = RT.Helpers.formatDate(task.dueDate);
    const overdue = RT.Helpers.isOverdue(task.dueDate);
    const tags = (task.tags || []).map(tag => `<span class="bg-secondary-container/30 text-secondary px-2 py-0.5 rounded text-[10px] font-label-mono">${RT.Helpers.esc(tag)}</span>`).join('');
    const priorityColors = { low: 'bg-surface-variant text-on-surface-variant', medium: 'bg-primary/10 text-primary', high: 'bg-error-container/20 text-error', critical: 'bg-error-container/30 text-error' };
    const badgeCls = priorityColors[task.priority] || 'bg-surface-variant text-on-surface-variant';
    return `
      <div class="task-item flex items-center gap-3 px-lg py-md border-b border-outline-variant hover:bg-surface-container-low transition-colors group" data-id="${task.id}">
        <input type="checkbox" class="task-checkbox" ${task.done ? 'checked' : ''}>
        <div class="flex-1 min-w-0">
          <div class="task-text font-body-md${task.done ? ' completed' : ''} text-on-surface cursor-pointer">${RT.Helpers.esc(task.text)}</div>
          <div class="flex items-center gap-2 mt-1 flex-wrap">
            <span class="font-label-mono text-[10px] px-1.5 ${badgeCls} border border-outline-variant/20 rounded">${task.priority}</span>
            ${task.category ? `<span class="bg-secondary-container/30 text-secondary px-2 py-0.5 rounded text-[10px] font-label-mono">${RT.Helpers.esc(task.category)}</span>` : ''}
            ${tags}
            ${dateLabel ? `<span class="font-label-mono text-[11px] text-on-surface-variant${overdue ? ' text-error' : ''}">${dateLabel}</span>` : ''}
          </div>
        </div>
        <button class="task-delete material-symbols-outlined text-on-surface-variant hover:text-error text-sm cursor-pointer" title="Delete task">close</button>
      </div>
    `;
  },

  deadlineItem(task) {
    const label = RT.Helpers.formatDate(task.dueDate);
    const overdue = RT.Helpers.isOverdue(task.dueDate);
    return `
      <div class="flex items-center justify-between px-lg py-md hover:bg-surface-container-high transition-colors cursor-pointer">
        <div class="flex items-center gap-md">
          <span class="material-symbols-outlined text-outline">circle</span>
          <div>
            <p class="font-body-md text-on-surface">${RT.Helpers.esc(task.text)}</p>
            <p class="font-label-mono text-[11px] text-on-surface-variant mt-xs">${label}</p>
          </div>
        </div>
        ${overdue ? '<span class="text-error font-label-mono text-[10px]">OVERDUE</span>' : ''}
      </div>
    `;
  },

  kanbanCard(task) {
    const dateLabel = RT.Helpers.formatDate(task.dueDate);
    const priorityColors = { low: 'bg-surface-variant text-on-surface-variant', medium: 'bg-primary/10 text-primary', high: 'bg-error-container/20 text-error', critical: 'bg-error-container/30 text-error' };
    const badgeCls = priorityColors[task.priority] || 'bg-surface-variant text-on-surface-variant';
    return `
      <div class="kanban-card task-card bg-surface-container-low border border-outline-variant p-md rounded cursor-grab active:cursor-grabbing transition-all" draggable="true" data-id="${task.id}">
        <div class="flex justify-between items-start mb-2">
          <span class="font-label-mono text-[11px] text-on-surface-variant opacity-60">RT-${task.id.slice(-3)}</span>
          <span class="px-2 py-0.5 rounded-full ${badgeCls} text-[10px] font-bold uppercase tracking-tighter">${task.priority}</span>
        </div>
        <h4 class="font-body-md text-body-md mb-md leading-tight text-on-surface">${RT.Helpers.esc(task.text)}</h4>
        <div class="flex items-center justify-between">
          <div class="flex gap-base">
            ${dateLabel ? `<span class="font-label-mono text-[11px] text-on-surface-variant">${dateLabel}</span>` : ''}
          </div>
        </div>
      </div>
    `;
  },

  barChart(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const maxVal = Math.max(1, ...data.map(a => a.completed));
    container.innerHTML = data.map(a => {
      const pct = Math.max(4, (a.completed / maxVal) * 100);
      return `
        <div class="flex-1 group/bar relative flex flex-col items-center justify-end h-full">
          <div class="absolute -top-6 opacity-0 group-hover/bar:opacity-100 transition-opacity bg-surface-container-highest border border-outline-variant text-label-mono text-[10px] py-1 px-2 pointer-events-none z-10">${a.completed} Tasks</div>
          <div class="w-full bg-surface-container-highest group-hover/bar:bg-primary/20 transition-colors rounded-t flex items-end justify-center" style="height:${pct}%">
            <div class="w-full bg-primary/40 group-hover/bar:bg-primary h-full rounded-t transition-all duration-500"></div>
          </div>
          <span class="mt-1 font-label-mono text-[10px] text-on-surface-variant">${a.dayName}</span>
        </div>
      `;
    }).join('');
  },

  heatmapGrid(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const data = RT.AnalyticsService.getHeatmapData(210);
    const maxVal = Math.max(1, ...Object.values(data));
    const dates = [];
    const now = new Date();
    for (let i = 209; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().slice(0, 10));
    }
    container.innerHTML = '';
    dates.forEach(dateStr => {
      const count = data[dateStr] || 0;
      const intensity = count / maxVal;
      const cell = document.createElement('div');
      cell.className = 'heatmap-cell w-full h-full rounded-sm';
      if (count === 0) {
        cell.classList.add('bg-surface-container-low', 'border', 'border-outline-variant/10');
      } else if (intensity < 0.25) {
        cell.classList.add('bg-primary/20');
      } else if (intensity < 0.5) {
        cell.classList.add('bg-primary/40');
      } else if (intensity < 0.75) {
        cell.classList.add('bg-primary/70');
      } else {
        cell.classList.add('bg-primary');
      }
      cell.title = `${dateStr}: ${count} tasks`;
      container.appendChild(cell);
    });
  },

  heatmap(canvasId, weeks = 26, width = 720) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const data = RT.AnalyticsService.getHeatmapData(weeks * 7);
    const ctx = canvas.getContext('2d');
    const cell = 11, gap = 3, rows = 7, cols = weeks;

    canvas.width = Math.max(width, cols * (cell + gap) + gap);
    canvas.height = rows * (cell + gap) + gap;

    ctx.fillStyle = '#141313';
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
      if (count === 0) color = '#1c1b1b';
      else if (intensity < 0.25) color = 'rgba(200,198,200,0.2)';
      else if (intensity < 0.5) color = 'rgba(200,198,200,0.4)';
      else if (intensity < 0.75) color = 'rgba(200,198,200,0.7)';
      else color = '#c8c6c8';
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, cell, cell, 2);
      ctx.fill();
    });
  },
};
