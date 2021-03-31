const TODO_URL = 'http://localhost:3000/todos';
const TIME_URL = 'http://localhost:3000/info';

export async function getTasksAsync() {
    const response = await fetch(TODO_URL);
    const data = await response.json();
    return data;
}

export async function getTaskAsync(id) {
    const res = await fetch(`${TODO_URL}/${id}`);
    const dataRes = await res.json();
    return dataRes;
}

export async function createTaskAsync(task) {
    const options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },

        body: JSON.stringify(task),
    };
    const newRecordResponse = await fetch(TODO_URL, options);
    const dataRes = await newRecordResponse.json();
    return dataRes;
}

export async function updateTaskAsync(task) {
    const options = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    };
    const url = `${TODO_URL}/${task.id}`;
    const response = await fetch(url, options);
    const data = await response.json();
    return data;
}

export async function deleteTaskAsync(id) {
    const url = `${TODO_URL}/${id}`;
    const res = await fetch(url, {
        method: 'DELETE',
    })
    const data = await response.json();
    return data;
}

export async function updateTimeAsync(time) {
    const options = {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            "lastDateModified": time,
        }),
    };
    const response = await fetch(TIME_URL, options);
    const data = await response.json();
    return data;
}

export async function getDateAsync() {
    const response = await fetch(TIME_URL);
    const data = await response.json();
    return data;
}