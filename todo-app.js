(function () {
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
  function createTodoItemElement(todoItem) {
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

    // Обработчики кнопок для нового дела
    doneButton.addEventListener('click', async function () {
      item.classList.toggle('list-group-item-success');
      todoItem.done = !todoItem.done;

      // Отправляем PATCH-запрос для обновления статуса на сервере
      try {
        const response = await fetch(`http://localhost:3000/api/todos/${todoItem.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ done: todoItem.done })
        });

        if (!response.ok) {
          throw new Error('Ошибка при обновлении статуса дела');
        }
      } catch (error) {
        console.error(error);
      }
    });

    deleteButton.addEventListener('click', async function () {
      if (confirm('Вы уверены?')) {
        // Отправляем DELETE-запрос на сервер
        try {
          const response = await fetch(`http://localhost:3000/api/todos/${todoItem.id}`, {
            method: 'DELETE'
          });

          if (!response.ok) {
            throw new Error('Ошибка при удалении дела');
          }

          item.remove(); // Удаляем элемент из DOM
        } catch (error) {
          console.error(error);
        }
      }
    });

    buttonGroup.append(doneButton);
    buttonGroup.append(deleteButton);
    item.append(buttonGroup);

    return item;
  }

  /**
   * Основная функция, создающая вс�� приложение
   */
  async function createTodoApp(container, title = 'Список дел', owner) {
    let todoAppTitle = createAppTitle(title);
    let todoItemForm = createTodoItemForm();
    let todoList = createTodoList();

    container.append(todoAppTitle);
    container.append(todoItemForm.form);
    container.append(todoList);

    const response = await fetch(`http://localhost:3000/api/todos?owner=${owner}`);
    const todoItemList = await response.json();

    todoItemList.forEach(todoItem => {
      const todoItemElement = createTodoItemElement(todoItem);
      todoList.append(todoItemElement);
    });

    // Обработчик изменения текста в поле ввода
    todoItemForm.input.addEventListener('input', function () {
      todoItemForm.button.disabled = !todoItemForm.input.value.trim();
    });

    // Обработчик отправки формы (добавление нового дела)
    todoItemForm.form.addEventListener('submit', async e => {
      e.preventDefault();

      if (!todoItemForm.input.value) {
        return;
      }

      // Запись нового дела на сервер
      try {
        const response = await fetch('http://localhost:3000/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: todoItemForm.input.value.trim(),
            owner: owner,
          })
        });

        if (!response.ok) {
          throw new Error('Ошибка при добавлении дела');
        }

        const todoItem = await response.json();
        let todoItemElement = createTodoItemElement(todoItem);

        // Добавляем дело в DOM
        todoList.append(todoItemElement);

        // Очищаем поле ввода и блокируем кнопку
        todoItemForm.input.value = '';
        todoItemForm.button.disabled = true;
      } catch (error) {
        console.error(error);
      }
    });
  }

  window.createTodoApp = createTodoApp;
})();
