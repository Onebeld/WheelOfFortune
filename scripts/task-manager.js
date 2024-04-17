const TASKS_PATH = "assets/localization/tasks/";

export let tasks = [];

async function fetchTasks(locale) {
    const response = await fetch(`${TASKS_PATH}${locale}.json`);
    return await response.json();
}

export async function loadTasks() {
    tasks = await fetchTasks(locale);
}