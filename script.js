document.addEventListener('DOMContentLoaded', function() {
    const taskInput = document.getElementById('taskInput');
    const addTaskBtn = document.getElementById('addTaskBtn');
    const taskList = document.getElementById('taskList');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const tasksLeft = document.getElementById('tasksLeft');
    const clearCompletedBtn = document.getElementById('clearCompleted');
    
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    
    // Render tasks
    function renderTasks(filter = 'all') {
        taskList.innerHTML = ''; // Clear the current task list
    
        // Filter tasks based on the selected filter
        const filteredTasks = tasks.filter(task => {
            if (filter === 'active') return !task.completed;
            if (filter === 'completed') return task.completed;
            return true; // Show all tasks if no specific filter is applied
        });
    
        if (filteredTasks.length === 0) {
            const emptyMessage = document.createElement('li');
            emptyMessage.textContent = filter === 'all' ? 'No tasks yet!' : 
                                      filter === 'active' ? 'No active tasks!' : 'No completed tasks!';
            emptyMessage.classList.add('empty-message');
            emptyMessage.style.textAlign = 'center';
            emptyMessage.style.padding = '20px';
            emptyMessage.style.color = 'var(--gray-color)';
            taskList.appendChild(emptyMessage);
        } else {
            filteredTasks.forEach(task => {
                const taskItem = document.createElement('li');
                taskItem.classList.add('task-item');
                if (task.completed) {
                    taskItem.classList.add('completed');
                }
                
                taskItem.innerHTML = `
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} data-id="${task.id}">
                    <span class="task-text">${task.text}</span>
                    <button class="delete-btn" data-id="${task.id}"><i class="fas fa-trash-alt"></i></button>
                `;
                
                taskList.appendChild(taskItem);
            });
        }
    
        updateTasksLeft();
    }
    
    
    // Add new task
    function addTask() {
        const text = taskInput.value.trim();
        if (text) {
            const newTask = {
                id: Date.now(),
                text,
                completed: false // New task is active by default
            };
            
            tasks.unshift(newTask);  // Add the new task to the list
            saveTasks();
        
            taskInput.value = '';  // Clear the input field
        
            // Render tasks with the current active filter (e.g., Active, Completed, or All)
            renderTasks(getCurrentFilter());  // Ensure the task is displayed under the correct filter
        }
    }
    
    
    function toggleTask(id) {
        tasks = tasks.map(task => 
            task.id === Number(id) ? {...task, completed: !task.completed} : task
        );
        saveTasks();
    
        // Render tasks with the current active filter after toggling the task
        renderTasks(getCurrentFilter());
    }
    
    
    // Delete task
    function deleteTask(id) {
        tasks = tasks.filter(task => task.id !== Number(id));
        saveTasks();
        renderTasks(getCurrentFilter());
    }
    
// Update the clearCompleted function to show feedback
function clearCompleted() {
    const currentFilter = getCurrentFilter();
    let tasksToClear;
    
    if (currentFilter === 'completed') {
        // If we're viewing completed tasks, clear all visible tasks
        tasksToClear = tasks.filter(task => task.completed);
    } else {
        // Otherwise, clear all completed tasks (even if not currently visible)
        tasksToClear = tasks.filter(task => task.completed);
    }
    
    if (tasksToClear.length === 0) {
        // Show temporary message if no tasks to clear
        const originalText = clearCompletedBtn.textContent;
        clearCompletedBtn.innerHTML = '<i class="fas fa-broom"></i> No tasks to clear!';
        setTimeout(() => {
            clearCompletedBtn.innerHTML = '<i class="fas fa-broom"></i> Clear completed';
        }, 2000);
        return;
    }
    
    tasks = tasks.filter(task => !task.completed);
    saveTasks();
    renderTasks(currentFilter);
    
    // Show confirmation feedback
    const originalText = clearCompletedBtn.textContent;
    clearCompletedBtn.innerHTML = `<i class="fas fa-broom"></i> Cleared ${tasksToClear.length} tasks!`;
    setTimeout(() => {
        clearCompletedBtn.innerHTML = '<i class="fas fa-broom"></i> Clear completed';
    }, 2000);
}
    
    // Update tasks left counter
    function updateTasksLeft() {
        const activeTasks = tasks.filter(task => !task.completed).length;
        tasksLeft.textContent = `${activeTasks} ${activeTasks === 1 ? 'task' : 'tasks'} left`;
    }
    
    // Save tasks to localStorage
    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
    
    // Get current filter
    function getCurrentFilter() {
        const activeFilter = document.querySelector('.filter-btn.active');
        return activeFilter ? activeFilter.dataset.filter : 'all';  // Default to 'all' filter if no active tab is found
    }
    
    // Event listeners
    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') addTask();
    });
    
    taskList.addEventListener('click', function(e) {
        if (e.target.classList.contains('task-checkbox')) {
            toggleTask(e.target.dataset.id);
        } else if (e.target.classList.contains('delete-btn') || e.target.closest('.delete-btn')) {
            const btn = e.target.classList.contains('delete-btn') ? e.target : e.target.closest('.delete-btn');
            deleteTask(btn.dataset.id);
        }
    });
    
// Update the tab switching event listeners
filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove the active class from all buttons
        filterBtns.forEach(b => {
            b.classList.remove('active');
        });
        
        // Add the active class to the clicked button
        this.classList.add('active');
        
        // Render tasks with the selected filter
        renderTasks(this.dataset.filter);
    });
});


    clearCompletedBtn.addEventListener('click', clearCompleted);
    
    // Initial render
    renderTasks();
});