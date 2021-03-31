import 'regenerator-runtime/runtime';
import '../styles/main.css';
import { getTasksAsync, getTaskAsync, createTaskAsync, updateTaskAsync, deleteTaskAsync, updateTimeAsync, getDateAsync} from './request';
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
    const keyLSTasks = 'tasks';

    $input.value = localStorage.getItem(inputLocalKey);
    let lastDateModified  = JSON.parse(localStorage.getItem('time'));
    console.log(lastDateModified);

    let localTasks = localStorage.getItem(keyLSTasks);
    const serverTasks = await getTasksAsync(); 
    const localDate = await getDateAsync();   
    console.log(localDate.lastDateModified);
  

    let tasks = serverTasks

    console.log((lastDateModified > localDate.lastDateModified));
    console.log(lastDateModified)
    console.log(localDate.lastDateModified)

    if ((lastDateModified > localDate.lastDateModified)) {
        console.log((lastDateModified > localDate.lastDateModified));
        tasks = JSON.parse(localTasks);
        tasks.forEach(task => {
            createTaskAsync(task);
        })
    } 
    
    // if (tasks === null) {
    //     tasks = serverTasks;
    // } else {
    //     tasks = JSON.parse(tasks);
    // }

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
                    task.text = editTask.value
                    renderTasksList(list);
                    updateTaskAsync(task, task.id);
                }
            });

            liTask.append(editTask);
            $taskTable.append(liTask);

        });

        localStorage.setItem('tasks', JSON.stringify(tasks));
        localStorage.setItem('time', JSON.stringify(Date.now()));
    }


    const hideCompletedBtn = (tasks) => {
        const completedTask = tasks.find(task => task.completed);
        if (completedTask) {
            clearButton.style.display = 'inline-block';
        } else {
            clearButton.style.display = 'none';
        }
    }

    $input.addEventListener('keyup', (event) => {
        let valueToStore = $input.value;
        if (event.key === 'Enter') {
            tasks.push({ text: valueToStore, completed: false, id: ID() });
            $input.value = "";
            valueToStore = ""
            renderTasksList(tasks);

            tasks.forEach(task => {
                createTaskAsync(task);
            })
        }
        localStorage.setItem(inputLocalKey, valueToStore)
    });

    renderTasksList(tasks);

    function deleteComplete(event) {
        const deleteBtn = event.target;
        if (deleteBtn.classList.contains('destroy')) {
            const deleteId = deleteBtn.dataset.value;
            tasks = tasks.filter(task => task.id !== deleteId);
            renderTasksList(tasks);
            deleteTaskAsync(deleteId)
        }

        const completeBtn = event.target;
        if (completeBtn.classList.contains('toggle')) {
            const changeId = completeBtn.dataset.id;
            const task = tasks.find((el) => {
                return el.id === changeId;
            });
            task.completed = !task.completed;
            renderTasksList(tasks);
            tasks.forEach(task => {
                updateTaskAsync(task, changeId);
            }) 
        }
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
        renderTasksList(tasks);
    }

    updateTimeAsync(Date.now());

}

app();