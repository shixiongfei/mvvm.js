/*
 *  MVVM Demo
 *
 *  Copyright (c) 2022 Xiongfei Shi
 *
 *  Author: Xiongfei Shi <xiongfei.shi(a)icloud.com>
 *  License: Apache-2.0
 *
 *  https://github.com/shixiongfei/mvvm.js
 */

class Proxy {
  constructor(data) {
    this.data = data
    this.listeners = []
  }

  subscribe(listener) {
    this.listeners.push(listener)
  }

  notify() {
    this.listeners.forEach(listener => listener(this.data))
  }

  get() {
    return this.data
  }

  set(data) {
    this.data = data
    this.notify()
  }
}

class Model {
  constructor() {
    this._todos = new Proxy(JSON.parse(localStorage.getItem('todos')) || [])

    this.onTodosChanged(todos =>
      localStorage.setItem('todos', JSON.stringify(todos))
    )
  }

  get todos() {
    return this._todos.get()
  }

  onTodosChanged(listener) {
    this._todos.subscribe(listener)
  }

  addTodo(todoText) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text: todoText,
      complete: false
    }
    this._todos.set(this.todos.concat([todo]))
  }

  editTodo(id, updatedText) {
    this._todos.set(
      this.todos.map(todo =>
        todo.id === id
          ? { id: todo.id, text: updatedText, complete: todo.complete }
          : todo
      )
    )
  }

  deleteTodo(id) {
    this._todos.set(this.todos.filter(todo => todo.id !== id))
  }

  toggleTodo(id) {
    this._todos.set(
      this.todos.map(todo =>
        todo.id === id
          ? { id: todo.id, text: todo.text, complete: !todo.complete }
          : todo
      )
    )
  }
}

class View {
  constructor(viewModel) {
    this.viewModel = viewModel
    this.viewModel.onTodosChanged(todos => this.update(todos))

    this.app = document.querySelector('#root')
    this.form = this.createElement('form')
    this.input = this.createElement('input')
    this.input.type = 'text'
    this.input.placeholder = 'Add todo'
    this.input.name = 'todo'
    this.submitButton = this.createElement('button')
    this.submitButton.textContent = 'Submit'
    this.form.append(this.input, this.submitButton)
    this.title = this.createElement('h1')
    this.title.textContent = 'Todos'
    this.todoList = this.createElement('ul', 'todo-list')
    this.app.append(this.title, this.form, this.todoList)

    this._temporaryTodoText = ''

    this.todoList.addEventListener('input', event => {
      if (event.target.className === 'editable') {
        this._temporaryTodoText = event.target.innerText
      }
    })

    this.form.addEventListener('submit', event => {
      event.preventDefault()
      if (this.input.value) {
        this.viewModel.addTodo(this.input.value)
        this.input.value = ''
      }
    })

    this.todoList.addEventListener('click', event => {
      if (event.target.className === 'delete') {
        const id = parseInt(event.target.parentElement.id)
        this.viewModel.deleteTodo(id)
      }
    })

    this.todoList.addEventListener('focusout', event => {
      if (this._temporaryTodoText) {
        const id = parseInt(event.target.parentElement.id)
        this.viewModel.editTodo(id, this._temporaryTodoText)
        this._temporaryTodoText = ''
      }
    })

    this.todoList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id)
        this.viewModel.toggleTodo(id)
      }
    })
  }

  createElement(tag, className) {
    const element = document.createElement(tag)
    if (className) {
      element.classList.add(className)
    }
    return element
  }

  update(todos) {
    while (this.todoList.firstChild) {
      this.todoList.removeChild(this.todoList.firstChild)
    }

    this.title.textContent = `Todos (${todos.length})`

    if (todos.length === 0) {
      const p = this.createElement('p')
      p.textContent = 'Nothing to do! Add a task?'
      this.todoList.append(p)
    } else {
      todos.forEach(todo => {
        const li = this.createElement('li')
        li.id = todo.id

        const checkbox = this.createElement('input')
        checkbox.type = 'checkbox'
        checkbox.checked = todo.complete

        const span = this.createElement('span')
        span.contentEditable = true
        span.classList.add('editable')

        if (todo.complete) {
          const strike = this.createElement('s')
          strike.textContent = todo.text
          span.append(strike)
        } else {
          span.textContent = todo.text
        }

        const deleteButton = this.createElement('button', 'delete')
        deleteButton.textContent = 'Delete'
        li.append(checkbox, span, deleteButton)

        this.todoList.append(li)
      })
    }
  }

  render() {
    this.viewModel.renderTodos(todos => this.update(todos))
  }
}

class ViewModel {
  constructor() {
    this.model = new Model()
  }

  onTodosChanged(handler) {
    this.model.onTodosChanged(todos => handler(todos))
  }

  renderTodos(render) {
    render(this.model.todos)
  }

  addTodo(todoText) {
    this.model.addTodo(todoText)
  }

  editTodo(id, updatedText) {
    this.model.editTodo(id, updatedText)
  }

  deleteTodo(id) {
    this.model.deleteTodo(id)
  }

  toggleTodo(id) {
    this.model.toggleTodo(id)
  }
}

const app = new View(new ViewModel())
app.render()
