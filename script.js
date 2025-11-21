const list = document.getElementById('todo-list')
const itemCountSpan = document.getElementById('item-count')
const uncheckedCountSpan = document.getElementById('unchecked-count')

let todos = []
let lastId = 0

// ---------- Local Storage ----------

function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos))
}

function loadTodos() {
  const saved = localStorage.getItem('todos')

  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed)) {
        todos = parsed
      }
    } catch (e) {
      todos = []
    }
  }

  if (todos.length === 0) {
    // Якщо в localStorage нічого немає – забираємо дані з HTML-шаблону
    initFromDOM()
  } else {
    lastId = todos.reduce((max, t) => Math.max(max, t.id || 0), 0)
    render(todos)
  }

  updateCounter(todos)
}

// ---------- Ініціалізація з початкового HTML ----------

function initFromDOM() {
  const lis = Array.from(list.querySelectorAll('li'))

  todos = []
  lastId = 0

  lis.forEach(li => {
    const checkbox = li.querySelector('input[type="checkbox"]')
    const span = li.querySelector('label span')

    const text = span ? span.textContent.trim() : ''
    const checked = checkbox ? checkbox.checked : false

    let id = checkbox && checkbox.id ? Number(checkbox.id) : NaN
    if (!Number.isFinite(id) || id <= 0) {
      id = lastId + 1
    }
    if (id > lastId) lastId = id

    todos.push({
      id,
      text,
      checked
    })
  })

  render(todos)
  saveTodos()
}

// ---------- Створення нової справи ----------

function newTodo() {
  const text = prompt('Введіть текст нової справи:')
  if (!text) return

  const trimmed = text.trim()
  if (!trimmed) return

  const todo = {
    id: ++lastId,
    text: trimmed,
    checked: false
  }

  todos.push(todo)
  saveTodos()
  render(todos)
  updateCounter(todos)
}

// ---------- Рендер однієї справи ----------

function renderTodo(todo) {
  const checkedClass = todo.checked ? 'text-success text-decoration-line-through' : ''
  const checkedAttr = todo.checked ? 'checked' : ''

  return `
    <li class="list-group-item">
      <input
        type="checkbox"
        class="form-check-input me-2"
        id="${todo.id}"
        ${checkedAttr}
      />
      <label for="${todo.id}">
        <span class="${checkedClass}">${todo.text}</span>
      </label>
      <button class="btn btn-danger btn-sm float-end">delete</button>
    </li>
  `
}

// ---------- Рендер усього списку ----------

function render(todosArray) {
  const html = todosArray.map(renderTodo).join('')
  list.innerHTML = html
}

// ---------- Оновлення лічильників ----------

function updateCounter(todosArray) {
  const total = todosArray.length
  const unchecked = todosArray.filter(t => !t.checked).length

  itemCountSpan.textContent = total
  uncheckedCountSpan.textContent = unchecked
}

// ---------- Видалення справи ----------

function deleteTodo(id) {
  todos = todos.filter(t => t.id !== id)
  saveTodos()
  render(todos)
  updateCounter(todos)
}

// ---------- Зміна стану "зроблено/не зроблено" ----------

function checkTodo(id, checked) {
  const todo = todos.find(t => t.id === id)
  if (!todo) return

  todo.checked = checked
  saveTodos()
  render(todos)
  updateCounter(todos)
}

// ---------- Делегування подій на список ----------

list.addEventListener('click', function (event) {
  const target = event.target

  // Клік по кнопці delete
  if (target.matches('button')) {
    const li = target.closest('li')
    if (!li) return

    const checkbox = li.querySelector('input[type="checkbox"]')
    if (!checkbox) return

    const id = Number(checkbox.id)
    deleteTodo(id)
  }
})

list.addEventListener('change', function (event) {
  const target = event.target

  // Зміна checkbox
  if (target.matches('input[type="checkbox"]')) {
    const id = Number(target.id)
    const checked = target.checked
    checkTodo(id, checked)
  }
})

// ---------- Старт ----------

loadTodos()
