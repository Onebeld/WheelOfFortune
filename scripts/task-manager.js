const TASKS_PATH = "assets/localization/tasks/";

export let tasks = [];

/**
 * Fetches tasks for a specific locale.
 *
 * @param {string} locale - The locale for which tasks are fetched.
 * @return {Promise<Object>} A promise that resolves to the JSON object containing the tasks.
 */
async function fetchTasks(locale) {
    const response = await fetch(`${TASKS_PATH}${locale}.json`);
    return await response.json();
}

/**
 * Asynchronously loads tasks for a specific locale.
 *
 * @return {Promise<void>} A promise that resolves when the tasks are loaded.
 */
export async function loadTasks() {
    tasks = await fetchTasks(locale);
}