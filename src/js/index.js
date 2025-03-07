import 'regenerator-runtime/runtime';
import '../styles/main.css';
import { 
    getTasksAsync, 
    createTaskAsync,
    updateTaskAsynс,
    deleteTaskAsync,
    getDateAsync,
} from './request';
import { ID } from './utils';

async function app() {
    let $input = document.querySelector('#js-insert');
    let $taskTable = document.querySelector("#js-list");
    let $counter = document.querySelector("#js-total");
    const $tasksFilter = document.querySelector('#js-filters');
    const $tasksBtnFilter = document.querySelectorAll('#js-filters > li');
    let clearButton = document.querySelector("#js-clear-completed");


    const inputLocalKey = "text";
    const selectedFilterKey = "selectedFilter";
    $input.value = localStorage.getItem(inputLocalKey);
    
    const keyLSTasks = 'tasks';
    const timeKey = 'lastDateModified'

    let tasks = localStorage.getItem(keyLSTasks);

    if (tasks === null) {
        tasks = [];
    } else {
        tasks = JSON.parse(tasks);
    }

    const dateServer = await getDateAsync();
    const serverDate = dateServer.lastDateModified;
    let localDate = localStorage.getItem(timeKey);

    if (serverDate > localDate) {
        const serverTasks = await getTasksAsync();
        tasks = serverTasks;
        localStorage.setItem(timeKey, serverDate);
        localStorage.setItem(keyLSTasks, serverTasks);
    } else if(serverDate < localDate) {
        const serverTasks = await getTasksAsync();
        tasks.forEach(task => {
        })
        // serverTask.id = localTask.id &&
        // serverTask.status = localTask.status 

        // serverTasks !localTask   - DELETE

        // !serverTasks localTask   - POST

        // serverTasks.text !== localTask.text   - PATCH

        // POST tasks

    }



    // localStorage.setItem('tasks', JSON.stringify(tasks));

    const renderTasksList = (list) => {
        hideCompletedBtn(tasks);
        $counter.innerHTML = `${list.length} items left `;
        $taskTable.innerHTML = '';
        list.forEach((task) => {
            const checked = task.completed ? 'checked' : '';

            const liTask = document.createElement('li');
            liTask.id = task.id;
            if (task.completed) {
                liTask.classList.add('completed');
            }

            liTask.innerHTML = `
        <input ${checked} data-id="${task.id}" type="checkbox" class="toggle">
        <div class="todo">
        
        <span>${task.text}</span>
        
        </div>
        <button data-value="${task.id}" class="destroy"></button>`

            liTask.addEventListener('dblclick', () => {
                liTask.classList.add('editing');
                
            })

            const editTask = document.createElement('input');
            editTask.type = "text";
            editTask.className = "edit";
            editTask.value = task.text;
            editTask.addEventListener('keyup', (event) => {
                if (event.key === 'Escape') {
                    liTask.classList.remove('editing');
                }
                if (event.key === "Enter") {
                    liTask.classList.remove('editing');
                    task.text = editTask.value;
                    renderTasksList(list);
                    updateTaskAsynс(task.id, task);
                    localStorage.setItem(timeKey, JSON.stringify(Date.now()));
                }
            });

            liTask.append(editTask);
            $taskTable.append(liTask);

        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    const hideCompletedBtn = (tasks) => {
        const completedTask = tasks.find(task => task.completed);
        if (completedTask) {
            clearButton.style.display = 'inline-block';
        } else {
            clearButton.style.display = 'none';
        }
    }

    $input.addEventListener('keyup', async (event) => {
        let valueToStore = $input.value;
        if (event.key === 'Enter') {
            const task = { text: valueToStore, completed: false };
            const created = await createTaskAsync(task);
            tasks.push(created);
            
            $input.value = "";
            valueToStore = ""
            renderTasksList(tasks);
            localStorage.setItem(timeKey, JSON.stringify(Date.now()));
        }
        localStorage.setItem(inputLocalKey, valueToStore)

    });


    // const filtered = task
    renderTasksList(tasks);

    function deleteComplete(event) {
        const deleteBtn = event.target;
        if (deleteBtn.classList.contains('destroy')) {
            const deleteId = deleteBtn.dataset.value;
            tasks = tasks.filter(task => task.id !== Number.parseInt(deleteId, 10));
            renderTasksList(tasks);
            deleteTaskAsync(deleteId);
        }

        const completeBtn = event.target;
        if (completeBtn.classList.contains('toggle')) {
            const changeId = completeBtn.dataset.id;
            const task = tasks.find((el) => {
                return el.id === changeId;
            });
            task.completed = !task.completed;
            renderTasksList(tasks);
        }
        localStorage.setItem(timeKey, JSON.stringify(Date.now()));
    }


    $taskTable.addEventListener('click', deleteComplete);



    $tasksFilter.addEventListener('click', (event) => {
        const targetFilter = event.target;
        const filterType = targetFilter.dataset.value;

        if (filterType) {
            $tasksBtnFilter.forEach((filter) => {
                if (filter.dataset.value === filterType) {
                    filter.classList.add('selected');
                } else {
                    filter.classList.remove('selected');
                }
            })

            localStorage.setItem(selectedFilterKey, filterType);

            let filteredTasks = tasks;

            if (filterType === 'active') {
                filteredTasks = filteredTasks.filter(task => !task.completed)
            } else if (filterType === 'completed') {
                filteredTasks = filteredTasks.filter(task => task.completed)
            };

            renderTasksList(filteredTasks);
        }

    })
    let selectedLocalFilter = localStorage.getItem(selectedFilterKey);

    $tasksBtnFilter.forEach((filter) => {
        if (selectedLocalFilter === filter.dataset.value) {
            filter.classList.add('selected');
        } else {
            filter.classList.remove('selected');
        }
    })

    clearButton.addEventListener("click", () => {
        tasks = tasks.filter(elem => {
            return !elem.completed
        })

        renderTasksList(tasks);
    });

    window.onstorage = (ev) => {
        tasks = JSON.parse(ev.newValue);
        console.log(tasks);
        renderTasksList(tasks);
    }
}


app();