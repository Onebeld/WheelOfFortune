import { localization } from "./localization.js";

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

(async function init() {
    tasks = await fetchTasks(localization.locale);
})()