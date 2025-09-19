// Retrive todo from local storage or initialize an empty array
let todo = JSON.parse(localStorage.getItem("todo")) || [];
const todoInput = document.getElementById("todoInput");
const todoList = document.getElementById("todoList");
const taskSummary = document.getElementById("task-summary");
const addButton = document.querySelector(".btn");
const deleteButton = document.getElementById("deleteButton");

// Initialize
document.addEventListener("DOMContentLoaded", function () {
    addButton.addEventListener("click", addTask);
    todoInput.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            event.preventDefault();
            addTask();
        }
    });
    deleteButton.addEventListener("click", deleteAllTasks);
    displayTasks();
});

function addTask() {
    const newTask = todoInput.value.trim();
    if (newTask !== "") {
        todo.push({
            text: newTask,
            disabled: false,
        });
        saveToLocalStorage();
        todoInput.value = "";
        displayTasks();

        const lastTaskElement = todoList.lastElementChild;
        if (lastTaskElement) {
            lastTaskElement.querySelector('.todo-container').classList.add('popping-in');
        }
    }
}

function displayTasks() {
    todoList.innerHTML = "";
    todo.forEach((item, index) => {
        const li = document.createElement("li");
        li.id = `container-${index}`;
        li.innerHTML = `
            <div class="todo-container">
                <input type="checkbox" class="todo-checkbox" id="input${index}" ${item.disabled ? "checked" : ""}>
                <p id="todo-${index}" class="${item.disabled ? "disabled" : ""} truncate-text">${item.text}</p>
                <div class="action-buttons">
                    <button class="edit-btn" onclick="editTask(${index})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.2rem" height="1.2rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M12 20h9"></path>
                            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-btn" onclick="deleteTask(${index})">&times;</button>
                    <button class="confirm-btn" onclick="confirmEdit(${index})">
                        <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        li.querySelector(".todo-checkbox").addEventListener("change", () => {
            toggleTask(index)
        });
        todoList.appendChild(li);
    });
    updateTaskSummary();
    updateScrollbar();
}

function editTask(index) {
    const liElement = document.getElementById(`container-${index}`);
    const todoContainer = liElement.querySelector('.todo-container');
    const todoItem = liElement.querySelector(`#todo-${index}`);
    
    // Düzenleme moduna geç
    todoContainer.classList.add('is-editing');
    // Metin kısaltmayı kaldır ki kullanıcı her şeyi görsün
    todoItem.classList.remove('truncate-text');

    const existingText = todo[index].text;
    const inputElement = document.createElement("input");
    inputElement.className = 'input-field';
    inputElement.maxLength = 80; 
    inputElement.value = existingText;
    inputElement.id = `input-edit-${index}`;

    todoItem.replaceWith(inputElement);
    inputElement.focus();
    
    const finishEditing = () => confirmEdit(index);
    inputElement.addEventListener("keydown", (event) => {
        if (event.key === "Enter") finishEditing();
    });
    inputElement.addEventListener("blur", finishEditing);
}

function confirmEdit(index) {
    const inputElement = document.getElementById(`input-edit-${index}`);
    if (inputElement) {
        const updatedText = inputElement.value.trim();
        if (updatedText) {
            todo[index].text = updatedText;
            saveToLocalStorage();
        }
        displayTasks();
    }
}


function toggleTask(index) {
    todo[index].disabled = !todo[index].disabled;
    saveToLocalStorage();
    const todoTextElement = document.getElementById(`todo-${index}`);

    if (todoTextElement) {
        if (todo[index].disabled) {
            // Tamamlanmış bir görevin metni kısaltılmaz, her zaman görünür
            todoTextElement.classList.add("disabled");
            todoTextElement.classList.remove("truncate-text");
        } else {
            // Tamamlanmamış bir görev tekrar kısaltılabilir
            todoTextElement.classList.remove("disabled");
            todoTextElement.classList.add("truncate-text");
        }
    }
    updateTaskSummary();
    displayTasks();
}

function deleteTask(index) {
    const taskElement = document.getElementById(`container-${index}`);
    if (taskElement) {
        todoList.classList.add('is-deleting-items');
        taskElement.querySelector('.todo-container').classList.add('popping-out');
        taskElement.classList.add('is-deleting');
        setTimeout(() => {
            todo.splice(index, 1);
            saveToLocalStorage();
            displayTasks();
            todoList.classList.remove('is-deleting-items');
        }, 350);
    }
}

function deleteAllTasks() {
    todo = [];
    saveToLocalStorage();
    displayTasks();
}

function saveToLocalStorage(){
    localStorage.setItem("todo", JSON.stringify(todo));
}

function updateTaskSummary() {
    const totalTasks = todo.length;
    const completedTasks = todo.filter(item => item.disabled).length;
    const remainingTasks = totalTasks - completedTasks;

    if (totalTasks === 0) {
        taskSummary.textContent = "Your list is empty!";
    } 
    else if (remainingTasks === 0) {
        taskSummary.textContent = "All tasks completed! Great job!";
    } 
    else {
        taskSummary.textContent = `${remainingTasks} remaining, ${completedTasks} completed`;
    }
}

const content = document.querySelector(".scroll-content");
const thumb = document.querySelector(".custom-scrollbar-thumb");
const wrapper = document.querySelector(".scroll-wrapper");

function updateScrollbar() {
    if (!content || !thumb || !wrapper) return;
    const scrollableHeight = content.scrollHeight - content.clientHeight;
    if (scrollableHeight <= 0) {
        wrapper.classList.add('hide-scrollbar');
        return;
    }
    wrapper.classList.remove('hide-scrollbar');
    const thumbHeight = (content.clientHeight / content.scrollHeight) * 100;
    thumb.style.height = `${thumbHeight}%`;
    const thumbPosition = (content.scrollTop / scrollableHeight) * (100 - thumbHeight);
    thumb.style.top = `${thumbPosition}%`;
}

content.addEventListener("scroll", updateScrollbar);

let isDragging = false;
let startY;
let startScrollTop;
thumb.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.pageY;
    startScrollTop = content.scrollTop;
    e.preventDefault(); 
});
window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const deltaY = e.pageY - startY;
    const scrollRatio = (content.scrollHeight - content.clientHeight) / (wrapper.clientHeight - thumb.clientHeight);
    content.scrollTop = startScrollTop + deltaY * scrollRatio;
});
window.addEventListener('mouseup', () => {
    isDragging = false;
});