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

class Model {
  constructor() {
    this.todos = JSON.parse(localStorage.getItem('todos')) || []
    this.listeners = []

    this.subscribe(todos =>
      localStorage.setItem('todos', JSON.stringify(todos))
    )
  }

  subscribe(listener) {
    this.listeners.push(listener)
  }

  notify() {
    this.listeners.forEach(listener => listener(this.todos))
  }

  set(todos) {
    this.todos = todos
    this.notify()
  }

  addTodo(todoText) {
    const todo = {
      id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1,
      text: todoText,
      complete: false
    }
    this.set(this.todos.concat([todo]))
  }

  editTodo(id, updatedText) {
    this.set(
      this.todos.map(todo =>
        todo.id === id
          ? { id: todo.id, text: updatedText, complete: todo.complete }
          : todo
      )
    )
  }

  deleteTodo(id) {
    this.set(this.todos.filter(todo => todo.id !== id))
  }

  toggleTodo(id) {
    this.set(
      this.todos.map(todo =>
        todo.id === id
          ? { id: todo.id, text: todo.text, complete: !todo.complete }
          : todo
      )
    )
  }
}

class View {
  constructor() {
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

  bindAddTodo(handler) {
    this.form.addEventListener('submit', event => {
      event.preventDefault()
      if (this.input.value) {
        handler(this.input.value)
        this.input.value = ''
      }
    })
  }

  bindDeleteTodo(handler) {
    this.todoList.addEventListener('click', event => {
      if (event.target.className === 'delete') {
        const id = parseInt(event.target.parentElement.id)
        handler(id)
      }
    })
  }

  bindEditTodo(handler) {
    this.todoList.addEventListener('focusout', event => {
      if (this._temporaryTodoText) {
        const id = parseInt(event.target.parentElement.id)
        handler(id, this._temporaryTodoText)
        this._temporaryTodoText = ''
      }
    })
  }

  bindToggleTodo(handler) {
    this.todoList.addEventListener('change', event => {
      if (event.target.type === 'checkbox') {
        const id = parseInt(event.target.parentElement.id)
        handler(id)
      }
    })
  }
}

class ViewModel {
  constructor(view, model) {
    this.view = view
    this.model = model

    this.bind()
  }

  bind() {
    this.modelBindView()
    this.viewBindModel()
  }

  modelBindView() {
    this.model.subscribe(todos => this.view.update(todos))
  }

  viewBindModel() {
    this.view.bindAddTodo(todoText => this.model.addTodo(todoText))
    this.view.bindDeleteTodo(id => this.model.deleteTodo(id))
    this.view.bindEditTodo((id, todoText) => this.model.editTodo(id, todoText))
    this.view.bindToggleTodo(id => this.model.toggleTodo(id))
  }

  render() {
    this.view.update(this.model.todos)
  }
}

const app = new ViewModel(new View(), new Model())
app.render()
