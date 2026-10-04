"use strict";

// ==========================================
// Shared helpers
// ==========================================

const get = (id) => document.getElementById(id);
const STORAGE_KEY = "taskflow-weekly-project";

function createElement(tag, className, text) {
  const node = document.createElement(tag);

  if (className) {
    node.className = className;
  }

  if (text !== undefined) {
    node.textContent = text;
  }

  return node;
}

// ==========================================
// Hamburger navigation
// ==========================================

const menuButton = get("menu-toggle");
const navigation = get("main-navigation");

function setMenuOpen(open) {
  navigation.classList.toggle("is-open", open);
  menuButton.setAttribute("aria-expanded", String(open));

  menuButton.setAttribute(
    "aria-label",
    open ? "Close navigation" : "Open navigation"
  );
}

menuButton.addEventListener("click", () => {
  const open =
    menuButton.getAttribute("aria-expanded") === "true";

  setMenuOpen(!open);
});

navigation.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenuOpen(false));
});

document.addEventListener("click", (event) => {
  if (
    !navigation.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    setMenuOpen(false);
  }
});

document.addEventListener("keydown", (event) => {
  if (
    event.key === "Escape" &&
    menuButton.getAttribute("aria-expanded") === "true"
  ) {
    setMenuOpen(false);
    menuButton.focus();
  }
});

window.matchMedia("(max-width: 760px)")
  .addEventListener("change", () => setMenuOpen(false));

// ==========================================
// Date display
// ==========================================

function renderDate() {
  get("today-date").textContent =
    new Date().toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric"
    });
}

renderDate();

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    renderDate();
  }
});

// ==========================================
// Load and validate saved tasks
// ==========================================

function showStorageWarning(text) {
  get("storage-note").textContent = text;
  get("storage-note").classList.add("error");
}

function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      throw new Error("Invalid saved task data.");
    }

    const usedIds = new Set();

    const validTasks = parsed.filter((task) => {
      const valid =
        task !== null &&
        typeof task === "object" &&
        typeof task.id === "string" &&
        task.id.length > 0 &&
        !usedIds.has(task.id) &&
        typeof task.title === "string" &&
        task.title.trim().length > 0 &&
        task.title.length <= 150 &&
        typeof task.completed === "boolean";

      if (valid) {
        usedIds.add(task.id);
      }

      return valid;
    });

    if (validTasks.length !== parsed.length) {
      showStorageWarning(
        "Some invalid saved records were skipped."
      );
    }

    return validTasks;
  } catch {
    showStorageWarning(
      "Saved tasks could not be loaded. You can still use the task manager."
    );

    return [];
  }
}

let tasks = loadTasks();
let activeFilter = "all";

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

    get("storage-note").textContent =
      "Your tasks are saved automatically in this browser.";

    get("storage-note").classList.remove("error");
  } catch {
    showStorageWarning(
      "Browser storage is unavailable. Changes are temporary and may reset after refresh."
    );
  }
}

function createTaskId() {
  let id;

  do {
    id = window.crypto &&
      typeof window.crypto.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  } while (tasks.some((task) => task.id === id));

  return id;
}

function showFeedback(text) {
  get("feedback").textContent = text;
}

function commitChange(text) {
  saveTasks();
  renderTasks();
  showFeedback(text);
}

// ==========================================
// Statistics and progress
// ==========================================

function renderStats() {
  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingCount = tasks.length - completedCount;

  const percentage = tasks.length === 0
    ? 0
    : Math.round((completedCount / tasks.length) * 100);

  get("total-count").textContent = tasks.length;
  get("pending-count").textContent = pendingCount;
  get("completed-count").textContent = completedCount;

  get("progress-text").textContent = `${percentage}%`;
  get("completion-progress").value = percentage;
  get("completion-progress").textContent = `${percentage}%`;

  get("clear-completed").disabled = completedCount === 0;
}

// ==========================================
// Render tasks
// ==========================================

function getVisibleTasks() {
  const query = get("task-search").value.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(query);

    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "pending" && !task.completed) ||
      (activeFilter === "completed" && task.completed);

    return matchesSearch && matchesFilter;
  });
}

function renderTasks() {
  const list = get("task-list");
  const visibleTasks = getVisibleTasks();

  list.replaceChildren();

  const fragment = document.createDocumentFragment();

  visibleTasks.forEach((task) => {
    const item = createElement(
      "li",
      task.completed
        ? "task-item completed"
        : "task-item"
    );

    const checkbox = createElement("input", "task-checkbox");
    checkbox.type = "checkbox";
    checkbox.id = `task-${task.id}`;
    checkbox.checked = task.completed;

    const content = createElement("div", "task-content");

    const title = createElement(
      "label",
      "task-title",
      task.title
    );

    title.htmlFor = checkbox.id;

    const status = createElement(
      "span",
      "task-status",
      task.completed ? "Completed" : "Pending"
    );

    content.append(title, status);

    checkbox.addEventListener("change", () => {
      task.completed = checkbox.checked;

      commitChange(
        task.completed
          ? "Task marked complete. Nice progress!"
          : "Task marked pending."
      );

      const updatedCheckbox = get(`task-${task.id}`);

      if (updatedCheckbox) {
        updatedCheckbox.focus();
      } else {
        // The task may disappear from the active filter.
        get("task-input").focus();
      }
    });

    const deleteButton = createElement(
      "button",
      "delete-button",
      "Delete"
    );

    deleteButton.type = "button";

    deleteButton.setAttribute(
      "aria-label",
      `Delete task: ${task.title}`
    );

    deleteButton.addEventListener("click", () => {
      const currentIndex = visibleTasks.findIndex(
        (entry) => entry.id === task.id
      );

      tasks = tasks.filter((entry) => entry.id !== task.id);
      commitChange("Task deleted.");

      const remaining = getVisibleTasks();

      const nextTask =
        remaining[currentIndex] ||
        remaining[currentIndex - 1];

      if (nextTask) {
        get(`task-${nextTask.id}`).focus();
      } else {
        get("task-input").focus();
      }
    });

    item.append(checkbox, content, deleteButton);
    fragment.append(item);
  });

  list.append(fragment);

  get("list-summary").textContent =
    `${visibleTasks.length} ${
      visibleTasks.length === 1 ? "task" : "tasks"
    } displayed`;

  const emptyState = get("empty-state");
  emptyState.hidden = visibleTasks.length > 0;

  if (tasks.length === 0) {
    emptyState.querySelector("h3").textContent = "No tasks yet.";

    emptyState.querySelector("p").textContent =
      "Add your first task and start making progress.";
  } else {
    emptyState.querySelector("h3").textContent =
      "No matching tasks.";

    emptyState.querySelector("p").textContent =
      "Try another filter or change your search.";
  }

  renderStats();
}

// ==========================================
// Add tasks using the button or Enter key
// ==========================================

get("task-form").addEventListener("submit", (event) => {
  event.preventDefault();

  const input = get("task-input");
  const title = input.value.trim();

  if (!title || title.length > 150) {
    get("task-error").textContent =
      "Enter a task between 1 and 150 characters.";

    input.setAttribute("aria-invalid", "true");
    input.focus();
    return;
  }

  get("task-error").textContent = "";
  input.setAttribute("aria-invalid", "false");

  tasks.unshift({
    id: createTaskId(),
    title,
    completed: false
  });

  // Make the newly added task visible immediately.
  activeFilter = "all";
  get("task-search").value = "";
  updateFilterButtons();

  input.value = "";
  commitChange("Task added successfully.");
  input.focus();
});

get("task-input").addEventListener("input", () => {
  get("task-error").textContent = "";
  get("task-input").setAttribute("aria-invalid", "false");
});

// ==========================================
// Filters and search
// ==========================================

function updateFilterButtons() {
  document.querySelectorAll("[data-filter]").forEach((button) => {
    const active = button.dataset.filter === activeFilter;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;

    updateFilterButtons();
    renderTasks();
    showFeedback("");
  });
});

get("task-search").addEventListener("input", () => {
  renderTasks();
  showFeedback("");
});

// ==========================================
// Clear completed tasks
// ==========================================

get("clear-completed").addEventListener("click", () => {
  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  tasks = tasks.filter((task) => !task.completed);

  commitChange(
    `${completedCount} completed ${
      completedCount === 1 ? "task" : "tasks"
    } removed.`
  );

  get("task-input").focus();
});

// ==========================================
// Initial rendering
// ==========================================

updateFilterButtons();
renderTasks();