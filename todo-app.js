(function () {
  /**
   * Находит максимальный id в массиве дел
   */
  function getMaxId(array) {
    let maxId = 0;
    array.forEach(item => {
      if (item.id > maxId) {
        maxId = item.id;
      }
    });
    return maxId;
  }

  /**
   * Создает заголовок для приложения списка дел
   */
  function createAppTitle(title) {
    let appTitle = document.createElement('h2');
    appTitle.innerHTML = title;
    return appTitle;
  }

  /**
   * Создает форму для добавления новых дел
   */
  function createTodoItemForm() {
    let form = document.createElement('form');
    let input = document.createElement('input');
    let buttonWrapper = document.createElement('div');
    let button = document.createElement('button');

    form.classList.add('input-group', 'mb-3');
    input.classList.add('form-control');
    input.placeholder = 'Введите название нового дела';
    buttonWrapper.classList.add('input-group-append');
    button.classList.add('btn', 'btn-primary');
    button.textContent = 'Добавить дело';
    button.disabled = true;

    buttonWrapper.append(button);
    form.append(input);
    form.append(buttonWrapper);

    return {
      form,
      input,
      button
    }
  }

  /**
   * Создает список для хранения элементов дел
   */
  function createTodoList() {
    let list = document.createElement('ul');
    list.classList.add('list-group');
    return list;
  }

  /**
   * Создает элемент списка дел
   */
  function createTodoItem(todoItem) {
    let item = document.createElement('li');
    let buttonGroup = document.createElement('div');
    let doneButton = document.createElement('button');
    let deleteButton = document.createElement('button');

    item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center');
    if (todoItem.done) {
      item.classList.add('list-group-item-success');
    }
    item.textContent = todoItem.name;
    // Сохраняем id в data-атрибуте
    item.dataset.id = todoItem.id;

    buttonGroup.classList.add('btn-group', 'btn-group-sm');
    doneButton.classList.add('btn', 'btn-success');
    doneButton.textContent = 'Готово';
    deleteButton.classList.add('btn', 'btn-danger');
    deleteButton.textContent = 'Удалить';

    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);

    return {
      item,
      doneButton,
      deleteButton
    }
  }

  /**
   * Основная функция, создающая всё приложение
   */
  function createTodoApp(container, title = 'Список дел', key = 'todos') {
    let todoAppTitle = createAppTitle(title);
    let todoItemForm = createTodoItemForm();
    let todoList = createTodoList();
    let todos = JSON.parse(localStorage.getItem(key) || '[]');

    container.append(todoAppTitle);
    container.append(todoItemForm.form);
    container.append(todoList);

    // Отрисовываем существующие дела
    todos.forEach(todoItem => {
      let todo = createTodoItem(todoItem);

      // Обработчики для существующих дел
      todo.doneButton.addEventListener('click', function () {
        todo.item.classList.toggle('list-group-item-success');
        todoItem.done = !todoItem.done;
        localStorage.setItem(key, JSON.stringify(todos));
      });

      todo.deleteButton.addEventListener('click', function () {
        if (confirm('Вы уверены?')) {
          todo.item.remove();
          todos = todos.filter(t => t.id !== todoItem.id);
          localStorage.setItem(key, JSON.stringify(todos));
        }
      });

      todoList.append(todo.item);
    });

    // Обработчик изменения текста в поле ввода
    todoItemForm.input.addEventListener('input', function () {
      todoItemForm.button.disabled = !todoItemForm.input.value.trim();
    });

    // Обработчик отправки формы
    todoItemForm.form.addEventListener('submit', function (e) {
      e.preventDefault();

      if (!todoItemForm.input.value) {
        return;
      }

      let newTodo = {
        id: getMaxId(todos) + 1,
        name: todoItemForm.input.value,
        done: false
      };

      let todoItem = createTodoItem(newTodo);

      // Обработчики для нового дела
      todoItem.doneButton.addEventListener('click', function () {
        todoItem.item.classList.toggle('list-group-item-success');
        newTodo.done = !newTodo.done;
        localStorage.setItem(key, JSON.stringify(todos));
      });

      todoItem.deleteButton.addEventListener('click', function () {
        if (confirm('Вы уверены?')) {
          todoItem.item.remove();
          todos = todos.filter(todo => todo.id !== newTodo.id);
          localStorage.setItem(key, JSON.stringify(todos));
        }
      });

      // Добавляем дело в массив и в DOM
      todos.push(newTodo);
      todoList.append(todoItem.item);
      localStorage.setItem(key, JSON.stringify(todos));

      // Очищаем поле ввода и блокируем кнопку
      todoItemForm.input.value = '';
      todoItemForm.button.disabled = true;
    });
  }

  window.createTodoApp = createTodoApp;
})();
