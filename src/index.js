import "./style.scss";

const ul = document.querySelector("ul");
const form = document.querySelector("form");
const addInput = document.querySelector("form > input");

//console.log(form, input);

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const task = addInput.value;
  addInput.value = "";
  addTodo(task);
});

const todos = [
  {
    task: "Emmerder le monde",
    done: false,
  },
  {
    task: "Manger une pomme",
    done: false,
    editMode: false,
  },
  {
    task: "Faire du café",
    done: true,
    editMode: false,
  },
];

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
  const editButton = document.createElement("button");
  editButton.innerHTML = "Edit";

  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    deleteTodo(index);
  });

  editButton.addEventListener("click", (event) => {
    event.stopPropagation();
    toggleEditTodo(index);
  });

  li.innerHTML = `<span class="todo ${todo.done ? "done" : ""}"></span>
          <p>${todo.task}</p>`;
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
  const saveButton = document.createElement("button");
  saveButton.innerHTML = "Save";
  const cancelButton = document.createElement("button");
  cancelButton.innerHTML = "Cancel";

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
  todos.push({ task, done: false, editMode: false });
  displayTodo();
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
  todos[index].task = editTask;
  toggleEditTodo(index);
  displayTodo();
};

displayTodo();
