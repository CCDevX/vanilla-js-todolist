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
  },
  {
    task: "Faire du café",
    done: true,
  },
];

const displayTodo = () => {
  const todosNode = todos.map((todo, index) => {
    return createTodoElement(todo, index);
  });

  ul.innerHTML = "";
  ul.append(...todosNode);
};

const createTodoElement = (todo, index) => {
  const li = document.createElement("li");
  const deleteButton = document.createElement("button");
  deleteButton.innerHTML = "Supprimer";
  deleteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    deleteTodo(index);
  });

  li.innerHTML = `<span class="todo ${todo.done ? "done" : ""}"></span>
          <p>${todo.task}</p>
          <button>Edit</button>`;
  li.addEventListener("click", (event) => {
    toggleTodo(index);
  });
  li.appendChild(deleteButton);
  return li;
};

const addTodo = (task) => {
  todos.push({ task, done: false });
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

displayTodo();
