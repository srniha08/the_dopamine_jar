const taskInput = document.getElementById('task-input');
const addBtn = document.getElementById('add-btn');
const taskList = document.getElementById('task-list');
const jarBody = document.getElementById('jar-body');
const countNum = document.getElementById('count-num');
const restartBtn = document.getElementById('restart-btn');

const marbleColors = ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#2dd4bf', '#38bdf8', '#818cf8', '#c084fc', '#f472b6'];

let tasks = JSON.parse(localStorage.getItem('jar_tasks')) || [];
let lastOpenDate = localStorage.getItem('jar_last_date') || "";

const todayString = new Date().toDateString();
if (lastOpenDate !== todayString) {
    tasks = tasks.filter(task => !task.completed); 
    localStorage.setItem('jar_last_date', todayString);
    localStorage.setItem('jar_tasks', JSON.stringify(tasks));
}

function saveToStorage() {
    localStorage.setItem('jar_tasks', JSON.stringify(tasks));
}

function getRandomColor() {
    return marbleColors[Math.floor(Math.random() * marbleColors.length)];
}

function render(newlyCompletedId = null) {
    taskList.innerHTML = '';
    jarBody.innerHTML = '';
    let completedCount = 0;

    tasks.forEach((task) => {
        if (!task.completed) {
            const li = document.createElement('li');
            li.className = 'task-item';
            li.innerHTML = `
                <button class="check-btn" id="btn-${task.id}" onclick="completeTask('${task.id}')"></button>
                <span>${task.text}</span>
            `;
            taskList.appendChild(li);
        }
    });

    const completedTasks = tasks.filter(t => t.completed).sort((a, b) => a.completedAt - b.completedAt);
    completedCount = completedTasks.length;

    completedTasks.forEach((task, index) => {
        const marble = document.createElement('div');
        
        if (task.id === newlyCompletedId) {
            marble.className = 'marble new-drop';
        } else {
            marble.className = 'marble';
        }
        
        marble.style.backgroundColor = task.color;

        // Force precise layout coordinates: 5 columns wide, 3 rows high, stacking bottom-up
        const columnPosition = (index % 5) + 1;
        const rowPosition = 3 - Math.floor(index / 5);

        marble.style.gridColumn = columnPosition;
        marble.style.gridRow = rowPosition;
        
        jarBody.appendChild(marble);
    });

    countNum.innerText = completedCount;

    if (completedCount >= 15) {
        setTimeout(() => {
            alert("🏆 Maximum efficiency reached! 15/15 goals smashed. Enjoy the clean slate.");
            clearJar();
        }, 700);
    }
}

function addTask() {
    if (tasks.length >= 15) {
        alert("⚠️ Hold your horses! You have 15 pending items. Clear your current plate first.");
        return;
    }

    const text = taskInput.value.trim();
    if (text === '') return;

    tasks.push({
        id: '_' + Math.random().toString(36).substr(2, 9),
        text: text,
        completed: false,
        color: getRandomColor(),
        completedAt: 0
    });

    taskInput.value = '';
    saveToStorage();
    render();
}

window.completeTask = function(id) {
    const taskIndex = tasks.findIndex(t => t.id === id);
    if (taskIndex === -1) return;

    const targetedBtn = document.getElementById(`btn-${id}`);
    const assignedColor = tasks[taskIndex].color;

    if (targetedBtn) {
        targetedBtn.style.backgroundColor = assignedColor;
        targetedBtn.classList.add('clicked');
    }

    setTimeout(() => {
        tasks[taskIndex].completed = true;
        tasks[taskIndex].completedAt = Date.now();
        saveToStorage();
        render(id); 
    }, 400); 
};

function clearJar() {
    tasks = tasks.filter(task => !task.completed); 
    saveToStorage();
    render();
}

function restartEverything() {
    if (confirm("Are you sure you want to abandon all current plans and wipe the slate clean?")) {
        tasks = []; 
        saveToStorage();
        render();
    }
}

addBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTask();
});
restartBtn.addEventListener('click', restartEverything);

render();