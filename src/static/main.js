const API = '/tasks';

function catClass(c) {
  return c === 'study' ? 'cat-study' : c === 'work' ? 'cat-work' : 'cat-personal';
}

function catLabel(c) {
  return c === 'study' ? 'учёба' : c === 'work' ? 'работа' : 'личное';
}

function prioLabel(p) {
  return p === 'high' ? 'высокий' : p === 'medium' ? 'средний' : 'низкий';
}

function fmtDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString('ru', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' });
}

let currentFilter = 'all';

async function loadTasks() {
  const res = await fetch(API + '/');
  let tasks = await res.json();

  const now = new Date();
  const sort = document.getElementById('sort-select').value;

  // Filter
  if (currentFilter === 'active')  tasks = tasks.filter(t => !t.is_done);
  if (currentFilter === 'done')    tasks = tasks.filter(t => t.is_done);
  if (currentFilter === 'overdue') tasks = tasks.filter(t => !t.is_done && t.deadline && new Date(t.deadline) < now);

  // Sort
  if (sort === 'deadline') {
    tasks.sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    });
  } else if (sort === 'priority') {
    const order = { high: 0, medium: 1, low: 2 };
    tasks.sort((a, b) => order[a.priority] - order[b.priority]);
  }

  // Stats
  const allRes = await fetch(API + '/');
  const allTasks = await allRes.json();
  const activeCount = allTasks.filter(t => !t.is_done).length;
  const doneCount = allTasks.filter(t => t.is_done).length;
  document.getElementById('stat-active').textContent = activeCount + ' активных';
  document.getElementById('stat-done').textContent = doneCount + ' выполнено';
  document.getElementById('section-label').textContent = tasks.length + ' задач';

  const container = document.getElementById('tasks-container');

  if (!tasks.length) {
    container.innerHTML = '<div class="dl-empty">нет задач</div>';
    return;
  }

  container.innerHTML = tasks.map(t => {
    const deadline = t.deadline ? new Date(t.deadline) : null;
    const overdue = !t.is_done && deadline && deadline < now;
    return `
      <div class="dl-task prio-${t.priority} ${t.is_done ? 'done-task' : ''} ${overdue ? 'overdue' : ''}">
        <div class="dl-check ${t.is_done ? 'checked' : ''}" onclick="toggleDone(${t.id})" title="Отметить выполненной"></div>
        <div class="dl-task-body">
          <div class="dl-task-title">${t.title}</div>
          ${t.description ? `<div class="dl-task-desc">${t.description}</div>` : ''}
          <div class="dl-task-meta">
            <span class="dl-tag ${catClass(t.category)}">${catLabel(t.category)}</span>
            <span class="dl-tag prio-${t.priority}">${prioLabel(t.priority)}</span>
            ${deadline ? `<span class="dl-deadline ${overdue ? 'overdue-text' : ''}">${overdue ? '⚠ ' : ''}${fmtDate(t.deadline)}</span>` : ''}
          </div>
        </div>
        <div class="dl-task-actions">
          <button class="dl-action del" onclick="deleteTask(${t.id})" title="Удалить">
            <i class="ti ti-trash" aria-hidden="true"></i>
          </button>
        </div>
      </div>`;
  }).join('');
}

async function addTask() {
  const title = document.getElementById('f-title').value.trim();
  if (!title) {
    document.getElementById('f-title').focus();
    return;
  }

  const deadlineVal = document.getElementById('f-deadline').value;

  await fetch(API + '/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title,
      description: document.getElementById('f-desc').value.trim() || null,
      deadline: deadlineVal ? new Date(deadlineVal).toISOString() : null,
      category: document.getElementById('f-cat').value,
      priority: document.getElementById('f-prio').value,
    })
  });

  document.getElementById('f-title').value = '';
  document.getElementById('f-desc').value = '';
  document.getElementById('f-deadline').value = '';

  loadTasks();
}

async function toggleDone(id) {
  await fetch(`${API}/${id}/done`, { method: 'PATCH' });
  loadTasks();
}

async function deleteTask(id) {
  await fetch(`${API}/${id}`, { method: 'DELETE' });
  loadTasks();
}

function setFilter(f, el) {
  currentFilter = f;
  document.querySelectorAll('.dl-filter').forEach(b => b.classList.remove('active'));
  el.classList.add('active');
  loadTasks();
}

// Enter to add task
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('f-title').addEventListener('keydown', e => {
    if (e.key === 'Enter') addTask();
  });
  loadTasks();
});