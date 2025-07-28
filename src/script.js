import "./style.scss";

// Sélection des éléments DOM
const todoForm = document.getElementById("todo-form");
const taskInput = document.getElementById("task-input");
const prioritySelect = document.getElementById("priority-select");
const todoList = document.getElementById("todo-list");
const emptyState = document.getElementById("empty-state");
const globalActions = document.getElementById("global-actions");
const clearCompletedBtn = document.getElementById("clear-completed");
const markAllCompleteBtn = document.getElementById("mark-all-complete");
const filterBtns = document.querySelectorAll(".filter-btn");
const notification = document.getElementById("notification");

// Éléments de statistiques
const totalTasksEl = document.getElementById("total-tasks");
const completedTasksEl = document.getElementById("completed-tasks");
const remainingTasksEl = document.getElementById("remaining-tasks");

// État de l'application
let todos = JSON.parse(localStorage.getItem("todos")) || [];
let currentFilter = "all";
let editingId = null;

// Classe Todo pour une meilleure structure
class Todo {
  constructor(task, priority = "medium") {
    this.id = Date.now() + Math.random();
    this.task = task.trim();
    this.priority = priority;
    this.completed = false;
    this.createdAt = new Date();
    this.completedAt = null;
  }

  toggle() {
    this.completed = !this.completed;
    this.completedAt = this.completed ? new Date() : null;
  }

  update(newTask, newPriority) {
    this.task = newTask.trim();
    this.priority = newPriority;
  }
}

// Initialisation
document.addEventListener("DOMContentLoaded", () => {
  renderTodos();
  updateStats();
  setupEventListeners();
});

// Configuration des écouteurs d'événements
function setupEventListeners() {
  // Formulaire d'ajout
  todoForm.addEventListener("submit", handleAddTodo);

  // Filtres
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      setActiveFilter(e.target.dataset.filter);
    });
  });

  // Actions globales
  clearCompletedBtn.addEventListener("click", clearCompleted);
  markAllCompleteBtn.addEventListener("click", markAllComplete);

  // Raccourcis clavier
  document.addEventListener("keydown", handleKeyboard);
}

// Gestion de l'ajout de tâche
function handleAddTodo(e) {
  e.preventDefault();

  const task = taskInput.value.trim();
  const priority = prioritySelect.value;

  if (!task) {
    showNotification("Veuillez entrer une tâche", "error");
    return;
  }

  if (task.length > 100) {
    showNotification("La tâche ne peut pas dépasser 100 caractères", "error");
    return;
  }

  const newTodo = new Todo(task, priority);
  todos.unshift(newTodo); // Ajouter au début

  // Réinitialiser le formulaire
  taskInput.value = "";
  prioritySelect.value = "medium";

  saveTodos();
  renderTodos();
  updateStats();

  showNotification("Tâche ajoutée avec succès !");

  // Focus sur l'input pour une meilleure UX
  taskInput.focus();
}

// Rendu des tâches
function renderTodos() {
  const filteredTodos = getFilteredTodos();

  // Afficher/masquer l'état vide
  emptyState.style.display = todos.length === 0 ? "block" : "none";
  globalActions.style.display = todos.length > 0 ? "flex" : "none";

  // Vider la liste
  todoList.innerHTML = "";

  if (filteredTodos.length === 0 && todos.length > 0) {
    todoList.innerHTML =
      '<li class="empty-filter">Aucune tâche ne correspond au filtre sélectionné</li>';
    return;
  }

  // Créer les éléments de tâche
  filteredTodos.forEach((todo) => {
    const todoElement = createTodoElement(todo);
    todoList.appendChild(todoElement);
  });
}

// Création d'un élément de tâche
function createTodoElement(todo) {
  const li = document.createElement("li");
  li.className = `todo-item ${todo.completed ? "completed" : ""} ${
    todo.priority
  }-priority`;
  li.dataset.id = todo.id;

  if (editingId === todo.id) {
    li.innerHTML = createEditTemplate(todo);
  } else {
    li.innerHTML = createTodoTemplate(todo);
  }

  setupTodoEventListeners(li, todo);

  return li;
}

// Template pour affichage normal
function createTodoTemplate(todo) {
  const priorityLabels = {
    high: "🔴 Haute",
    medium: "🟡 Moyenne",
    low: "🟢 Basse",
  };

  return `
        <div class="todo-checkbox ${
          todo.completed ? "checked" : ""
        }" data-action="toggle">
        </div>
        <div class="todo-content">
            <div class="todo-text ${
              todo.completed ? "completed" : ""
            }">${escapeHtml(todo.task)}</div>
            <div class="todo-priority">Priorité: ${
              priorityLabels[todo.priority]
            }</div>
        </div>
        <div class="todo-actions">
            <button class="btn btn-warning" data-action="edit">
                ✏️ Modifier
            </button>
            <button class="btn btn-danger" data-action="delete">
                🗑️ Supprimer
            </button>
        </div>
    `;
}

// Template pour édition
function createEditTemplate(todo) {
  return `
        <div class="todo-content" style="flex: 1;">
            <input type="text" class="todo-input" value="${escapeHtml(
              todo.task
            )}" maxlength="100">
            <select class="todo-priority-select">
                <option value="low" ${
                  todo.priority === "low" ? "selected" : ""
                }>🟢 Basse</option>
                <option value="medium" ${
                  todo.priority === "medium" ? "selected" : ""
                }>🟡 Moyenne</option>
                <option value="high" ${
                  todo.priority === "high" ? "selected" : ""
                }>🔴 Haute</option>
            </select>
        </div>
        <div class="todo-actions">
            <button class="btn btn-success" data-action="save">
                ✅ Sauver
            </button>
            <button class="btn btn-outline" data-action="cancel">
                ❌ Annuler
            </button>
        </div>
    `;
}

// Configuration des écouteurs pour une tâche
function setupTodoEventListeners(li, todo) {
  // Délégation d'événements
  li.addEventListener("click", (e) => {
    const action = e.target.dataset.action;
    const isCheckbox = e.target.classList.contains("todo-checkbox");

    if (isCheckbox) {
      toggleTodo(todo.id);
      return;
    }

    switch (action) {
      case "toggle":
        toggleTodo(todo.id);
        break;
      case "edit":
        startEdit(todo.id);
        break;
      case "delete":
        deleteTodo(todo.id);
        break;
      case "save":
        saveEdit(todo.id, li);
        break;
      case "cancel":
        cancelEdit();
        break;
    }
  });

  // Gestion des touches pour l'édition
  if (editingId === todo.id) {
    const input = li.querySelector(".todo-input");
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        saveEdit(todo.id, li);
      } else if (e.key === "Escape") {
        cancelEdit();
      }
    });
    input.focus();
    input.select();
  }
}

// Fonctions de manipulation des tâches
function toggleTodo(id) {
  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.toggle();
    saveTodos();
    renderTodos();
    updateStats();

    const message = todo.completed
      ? "Tâche marquée comme terminée !"
      : "Tâche marquée comme en cours !";
    showNotification(message);
  }
}

function startEdit(id) {
  editingId = id;
  renderTodos();
}

function saveEdit(id, li) {
  const input = li.querySelector(".todo-input");
  const select = li.querySelector(".todo-priority-select");
  const newTask = input.value.trim();

  if (!newTask) {
    showNotification("La tâche ne peut pas être vide", "error");
    return;
  }

  const todo = todos.find((t) => t.id === id);
  if (todo) {
    todo.update(newTask, select.value);
    editingId = null;
    saveTodos();
    renderTodos();
    showNotification("Tâche modifiée avec succès !");
  }
}

function cancelEdit() {
  editingId = null;
  renderTodos();
}

function deleteTodo(id) {
  if (confirm("Êtes-vous sûr de vouloir supprimer cette tâche ?")) {
    const todoElement = document.querySelector(`[data-id="${id}"]`);

    // Animation de suppression
    todoElement.classList.add("removing");

    setTimeout(() => {
      todos = todos.filter((t) => t.id !== id);
      saveTodos();
      renderTodos();
      updateStats();
      showNotification("Tâche supprimée");
    }, 300);
  }
}

// Actions globales
function clearCompleted() {
  const completedCount = todos.filter((t) => t.completed).length;

  if (completedCount === 0) {
    showNotification("Aucune tâche terminée à supprimer", "error");
    return;
  }

  if (confirm(`Supprimer ${completedCount} tâche(s) terminée(s) ?`)) {
    todos = todos.filter((t) => !t.completed);
    saveTodos();
    renderTodos();
    updateStats();
    showNotification(`${completedCount} tâche(s) supprimée(s)`);
  }
}

function markAllComplete() {
  const incompleteCount = todos.filter((t) => !t.completed).length;

  if (incompleteCount === 0) {
    showNotification("Toutes les tâches sont déjà terminées", "error");
    return;
  }

  todos.forEach((todo) => {
    if (!todo.completed) {
      todo.toggle();
    }
  });

  saveTodos();
  renderTodos();
  updateStats();
  showNotification(`${incompleteCount} tâche(s) marquée(s) comme terminées !`);
}

// Système de filtrage
function setActiveFilter(filter) {
  currentFilter = filter;

  // Mettre à jour l'UI des filtres
  filterBtns.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  renderTodos();
}

function getFilteredTodos() {
  switch (currentFilter) {
    case "active":
      return todos.filter((t) => !t.completed);
    case "completed":
      return todos.filter((t) => t.completed);
    case "high":
      return todos.filter((t) => t.priority === "high");
    default:
      return todos;
  }
}

// Mise à jour des statistiques
function updateStats() {
  const total = todos.length;
  const completed = todos.filter((t) => t.completed).length;
  const remaining = total - completed;

  // Animation des nombres
  animateNumber(totalTasksEl, total);
  animateNumber(completedTasksEl, completed);
  animateNumber(remainingTasksEl, remaining);
}

function animateNumber(element, newValue) {
  const currentValue = parseInt(element.textContent) || 0;

  if (currentValue === newValue) return;

  const difference = newValue - currentValue;
  const duration = 300;
  const steps = 10;
  const stepValue = difference / steps;
  let currentStep = 0;

  const timer = setInterval(() => {
    currentStep++;
    const value = Math.round(currentValue + stepValue * currentStep);
    element.textContent = currentStep === steps ? newValue : value;

    if (currentStep >= steps) {
      clearInterval(timer);
    }
  }, duration / steps);
}

// Système de notifications
function showNotification(message, type = "success") {
  notification.textContent = message;
  notification.className = `notification ${type}`;
  notification.classList.add("show");

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Gestion du stockage local
function saveTodos() {
  try {
    localStorage.setItem("todos", JSON.stringify(todos));
  } catch (error) {
    showNotification("Erreur lors de la sauvegarde", "error");
    console.error("Erreur localStorage:", error);
  }
}

// Raccourcis clavier
function handleKeyboard(e) {
  // Ctrl/Cmd + Enter pour ajouter rapidement
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    if (document.activeElement === taskInput) {
      todoForm.dispatchEvent(new Event("submit"));
    }
  }

  // Échap pour annuler l'édition
  if (e.key === "Escape" && editingId) {
    cancelEdit();
  }

  // Focus sur l'input avec Ctrl/Cmd + K
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    taskInput.focus();
  }
}

// Utilitaires
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Fonction de tri (optionnelle, pour usage futur)
function sortTodos(criteria) {
  switch (criteria) {
    case "priority":
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      todos.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
      break;
    case "date":
      todos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case "alphabetical":
      todos.sort((a, b) => {
        if (a.completed !== b.completed) {
          return a.completed ? 1 : -1;
        }
        return a.task.localeCompare(b.task);
      });
      break;
    default:
      break;
  }
  renderTodos();
}

// Export/Import des données (fonctionnalités bonus)
function exportTodos() {
  const dataStr = JSON.stringify(todos, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement("a");
  link.href = url;
  link.download = `todos-${new Date().toISOString().split("T")[0]}.json`;
  link.click();

  URL.revokeObjectURL(url);
  showNotification("Données exportées avec succès !");
}

function importTodos(event) {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedTodos = JSON.parse(e.target.result);

      if (Array.isArray(importedTodos)) {
        // Validation basique des données
        const validTodos = importedTodos.filter(
          (todo) =>
            todo.task &&
            typeof todo.task === "string" &&
            ["high", "medium", "low"].includes(todo.priority)
        );

        if (
          confirm(
            `Importer ${validTodos.length} tâche(s) ? Cela remplacera vos tâches actuelles.`
          )
        ) {
          todos = validTodos.map((todo) => {
            const newTodo = new Todo(todo.task, todo.priority);
            newTodo.completed = todo.completed || false;
            newTodo.id = todo.id || newTodo.id;
            return newTodo;
          });

          saveTodos();
          renderTodos();
          updateStats();
          showNotification("Données importées avec succès !");
        }
      } else {
        throw new Error("Format invalide");
      }
    } catch (error) {
      showNotification("Erreur lors de l'import du fichier", "error");
      console.error("Erreur import:", error);
    }
  };

  reader.readAsText(file);
}

// Fonction de recherche (bonus)
function searchTodos(query) {
  if (!query.trim()) {
    renderTodos();
    return;
  }

  const searchResults = todos.filter((todo) =>
    todo.task.toLowerCase().includes(query.toLowerCase())
  );

  // Mise à jour temporaire de l'affichage
  todoList.innerHTML = "";
  if (searchResults.length === 0) {
    todoList.innerHTML =
      '<li class="empty-filter">Aucune tâche trouvée pour cette recherche</li>';
  } else {
    searchResults.forEach((todo) => {
      const todoElement = createTodoElement(todo);
      todoList.appendChild(todoElement);
    });
  }
}

// Fonction pour obtenir des statistiques avancées
function getAdvancedStats() {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const stats = {
    total: todos.length,
    completed: todos.filter((t) => t.completed).length,
    byPriority: {
      high: todos.filter((t) => t.priority === "high").length,
      medium: todos.filter((t) => t.priority === "medium").length,
      low: todos.filter((t) => t.priority === "low").length,
    },
    completedToday: todos.filter(
      (t) => t.completedAt && new Date(t.completedAt) >= today
    ).length,
    createdToday: todos.filter((t) => new Date(t.createdAt) >= today).length,
  };

  return stats;
}

// Initialisation au chargement de la page
window.addEventListener("load", () => {
  // Vérifier le support du localStorage
  if (!window.localStorage) {
    showNotification("Le stockage local n'est pas supporté", "error");
  }

  // Ajouter des conseils d'utilisation
  if (todos.length === 0) {
    setTimeout(() => {
      showNotification(
        "💡 Astuce: Utilisez Ctrl+K pour accéder rapidement au champ de saisie"
      );
    }, 2000);
  }

  // Auto-focus sur l'input
  taskInput.focus();
});

// Gestion de la visibilité de la page (pour économiser les ressources)
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    // Actualiser l'affichage si nécessaire
    updateStats();
  }
});

// Fonction pour nettoyer les tâches anciennes (optionnelle)
function cleanOldTodos(daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const oldCompletedTodos = todos.filter(
    (t) => t.completed && t.completedAt && new Date(t.completedAt) < cutoffDate
  );

  if (oldCompletedTodos.length > 0) {
    if (
      confirm(
        `Supprimer ${oldCompletedTodos.length} tâche(s) terminée(s) depuis plus de ${daysOld} jours ?`
      )
    ) {
      todos = todos.filter((t) => !oldCompletedTodos.includes(t));
      saveTodos();
      renderTodos();
      updateStats();
      showNotification(
        `${oldCompletedTodos.length} anciennes tâches supprimées`
      );
    }
  } else {
    showNotification("Aucune ancienne tâche à supprimer");
  }
}

// Message de bienvenue dans la console
console.log(`
🎉 To-Do App Enhanced chargée !

Raccourcis clavier disponibles :
- Ctrl/Cmd + K : Focus sur le champ de saisie
- Ctrl/Cmd + Enter : Ajouter une tâche rapidement
- Escape : Annuler l'édition en cours
- Enter : Sauvegarder lors de l'édition

Fonctionnalités :
✅ Gestion des priorités
✅ Filtrage des tâches
✅ Statistiques en temps réel
✅ Sauvegarde automatique
✅ Animations fluides
✅ Interface responsive
✅ Notifications
✅ Mode édition en ligne

Version: 2.1.0
`);
