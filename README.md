# TaskFlow — Interactive To-Do App

A weekly project created by **Zeeshan Fida** for the **Tech SG Studio internship**.

TaskFlow is a responsive task manager built with HTML, CSS, and vanilla JavaScript, without frameworks or libraries.

## Features

- Add tasks using the button or Enter key
- Mark tasks as completed or pending
- Delete individual tasks
- Filter by All, Pending, or Completed
- Search tasks by description
- Clear completed tasks
- Display total, pending, and completed counts
- Show completion progress
- Save and restore tasks using localStorage
- Mobile hamburger navigation
- Responsive desktop, tablet, and mobile layouts
- Empty-state messages and input validation
- Keyboard-accessible controls

## Technologies

- HTML5
- CSS3
- JavaScript
- Browser localStorage

## Project Files

- `index.html` — Page structure, navigation, and task form
- `style.css` — Styling and responsive layouts
- `script.js` — Task management, events, filters, and storage
- `README.md` — Project documentation

## Run Locally

1. Download or clone this repository.
2. Keep all files in the same folder.
3. Open `index.html` in a browser.

Alternatively, open the folder in VS Code and launch the page using Live Server.

No installation or build command is required.

## How to Use

1. Enter a task and click **Add task**, or press Enter.
2. Select its checkbox to mark it completed.
3. Use the filter buttons or search field to find tasks.
4. Click **Delete** to remove a task.
5. Click **Clear completed** to remove all finished tasks.

Statistics and completion progress update automatically.

## Data Storage

Tasks are saved in the current browser using localStorage and restored after refresh.

Data does not sync across devices or browsers. Clearing browser storage removes saved tasks. If storage is unavailable, changes remain temporary and a warning appears.

## Manual Checks

- Add a task using the button and Enter key.
- Try submitting an empty task.
- Complete a task and check the statistics.
- Test search and all three filters.
- Delete a task and clear completed tasks.
- Refresh the page to check saved data.
- Check the hamburger menu and layout on mobile.

## Assignment Option

This project implements **Option A — Interactive To-Do List**, including the bonus localStorage feature.

## Author

**Zeeshan Fida**

Tech SG Studio — Weekly JavaScript Project
