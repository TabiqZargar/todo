/**
 * A professional task manager built with vanilla JavaScript.
 * Features: add, delete, toggle completion, inline edit, filtering,
 * local storage persistence, and task count tracking.
 */

// --- DOM References ---

const todoInput = document.getElementById('todo-input');
const addBtn = document.getElementById('add-btn');
const todoList = document.getElementById('todo-list');
const taskCount = document.getElementById('task-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');

// --- State ---

/** @type {Array<{id: string, text: string, done: boolean}>} */
let tasks = [];

/** @type {'all' | 'active' | 'completed'} */
let currentFilter = 'all';

// --- Persistence ---

/** Loads tasks from localStorage on page init. */
function loadTasks() {
  try {
    const data = localStorage.getItem('tasks');
    tasks = data ? JSON.parse(data) : [];
  } catch {
    tasks = [];
  }
}

/** Saves current tasks array to localStorage. */
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// --- Filtering & Count ---

/**
 * Returns tasks based on the active filter.
 * @returns {Array} Filtered task list.
 */
function getFilteredTasks() {
  if (currentFilter === 'active') return tasks.filter(t => !t.done);
  if (currentFilter === 'completed') return tasks.filter(t => t.done);
  return tasks;
}

/** Updates the header with the number of remaining (incomplete) tasks. */
function updateCount() {
  const remaining = tasks.filter(t => !t.done).length;
  taskCount.textContent = `${remaining} item${remaining !== 1 ? 's' : ''} left`;
}

// --- Rendering ---

/** Renders the filtered task list into the DOM. */
function render() {
  const filtered = getFilteredTasks();
  todoList.innerHTML = '';

  if (filtered.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'empty-state';
    empty.textContent = 'No tasks yet. Add one above!';
    todoList.appendChild(empty);
  } else {
    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = 'todo-item';
      li.dataset.id = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'todo-checkbox';
      checkbox.checked = task.done;
      checkbox.addEventListener('change', () => toggleTask(task.id));

      const span = document.createElement('span');
      span.className = `todo-text${task.done ? ' completed' : ''}`;
      span.textContent = task.text;
      span.addEventListener('dblclick', () => startEdit(task.id, span));

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'delete-btn';
      deleteBtn.innerHTML = '&times;';
      deleteBtn.setAttribute('aria-label', 'Delete task');
      deleteBtn.addEventListener('click', () => deleteTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(span);
      li.appendChild(deleteBtn);
      todoList.appendChild(li);
    });
  }

  updateCount();
}

// --- CRUD Operations ---

/** Creates a new task from the input value and re-renders. */
function addTodo() {
  const text = todoInput.value.trim();
  if (!text) return;

  tasks.push({
    id: Date.now().toString(),
    text,
    done: false,
  });

  todoInput.value = '';
  todoInput.focus();
  saveTasks();
  render();
}

/**
 * Toggles a task's completion state.
 * @param {string} id - The task ID.
 */
function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.done = !task.done;
    saveTasks();
    render();
  }
}

/**
 * Removes a task by ID.
 * @param {string} id - The task ID.
 */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

/**
 * Enables inline editing of a task's text on double-click.
 * @param {string} id - The task ID.
 * @param {HTMLSpanElement} span - The text element to edit.
 */
function startEdit(id, span) {
  const task = tasks.find(t => t.id === id);
  if (!task || task.done) return;

  span.contentEditable = true;
  span.classList.add('editing');
  span.focus();

  const selection = window.getSelection();
  const range = document.createRange();
  range.selectNodeContents(span);
  selection.removeAllRanges();
  selection.addRange(range);

  /** Saves or discards the edit on blur. */
  function finishEdit() {
    span.contentEditable = false;
    span.classList.remove('editing');
    const newText = span.textContent.trim();
    if (newText && newText !== task.text) {
      task.text = newText;
      saveTasks();
      render();
    } else {
      span.textContent = task.text;
    }
  }

  span.addEventListener('blur', finishEdit, { once: true });
  span.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      span.blur();
    }
    if (e.key === 'Escape') {
      span.textContent = task.text;
      span.blur();
    }
  });
}

// --- Filtering ---

/**
 * Sets the active filter and re-renders.
 * @param {'all' | 'active' | 'completed'} filter - The filter to apply.
 */
function setFilter(filter) {
  currentFilter = filter;
  filterBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === filter);
  });
  render();
}

/** Removes all completed tasks from the list. */
function clearCompleted() {
  const hadCompleted = tasks.some(t => t.done);
  if (!hadCompleted) return;
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  render();
}

// --- Event Listeners ---

addBtn.addEventListener('click', addTodo);
todoInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTodo();
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => setFilter(btn.dataset.filter));
});

clearCompletedBtn.addEventListener('click', clearCompleted);

// --- Init ---

loadTasks();
render();
