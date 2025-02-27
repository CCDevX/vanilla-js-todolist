import "./style.scss";

const ul = document.querySelector("ul");
const form = document.querySelector("form");
const addInput = document.querySelector("form > input");

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const task = addInput.value;
  addInput.value = "";
  addTodo(task);
});

const todos = [];

const displayTodo = () => {
  const todosNode = todos.map((todo, index) => {
    if (todo.editMode) {
      return createEditTodoElement(todo, index);
    } else {
      return createTodoElement(todo, index);
    }
  });

  ul.innerHTML = "";
  ul.append(...todosNode);
};

const createTodoElement = (todo, index) => {
  const li = document.createElement("li");

  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = "Delete";
  deleteButton.classList.add("danger");
  const editButton = document.createElement("button");
  editButton.innerHTML = "Edit";
  editButton.classList.add("primary");
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    deleteTodo(index);
  });

  editButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleEditTodo(index);
  });

  li.innerHTML = `<span class="todo ${todo.done ? "done" : ""}"></span>
          <p class="${todo.done ? "text-done" : ""}">${todo.task}</p>`;
  li.addEventListener("click", (event) => {
    toggleTodo(index);
  });
  li.append(editButton, deleteButton);
  return li;
};

const createEditTodoElement = (todo, index) => {
  const li = document.createElement("li");
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.value = todo.task;
  editInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      editTodo(index, editInput);
    } else if (event.key === "Escape") {
      toggleEditTodo(index);
    }
  });

  const saveButton = document.createElement("button");
  saveButton.innerHTML = "Save";
  saveButton.classList.add("success");
  const cancelButton = document.createElement("button");
  cancelButton.innerHTML = "Cancel";
  cancelButton.classList.add("danger");

  cancelButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleEditTodo(index);
  });

  saveButton.addEventListener("click", (event) => {
    event.stopPropagation();
    editTodo(index, editInput);
  });

  li.append(editInput, cancelButton, saveButton);
  return li;
};

const addTodo = (task) => {
  task.trim();
  if (task) {
    todos.push({
      task: `${task[0].toUpperCase()}${task.slice(1)}`,
      done: false,
      editMode: false,
    });
    displayTodo();
  }
};

const deleteTodo = (index) => {
  todos.splice(index, 1);
  displayTodo();
};

const toggleTodo = (index) => {
  todos[index].done = !todos[index].done;
  displayTodo();
};

const toggleEditTodo = (index) => {
  todos[index].editMode = !todos[index].editMode;
  displayTodo();
};

const editTodo = (index, editInput) => {
  const editTask = editInput.value;

  editTask.trim();
  if (editTask) {
    todos[index].task = `${editTask[0].toUpperCase()}${editTask.slice(1)}`;
    toggleEditTodo(index);
  }
};

displayTodo();
