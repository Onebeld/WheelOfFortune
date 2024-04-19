const NAMES_PATH = "assets/localization/names/";

export let names = [];

/**
 * Fetches tasks for a specific locale.
 *
 * @param {string} locale - The locale for which tasks are fetched.
 * @return {Promise<Object>} A promise that resolves to the JSON object containing the tasks.
 */
async function fetchNames(locale) {
    const response = await fetch(`${NAMES_PATH}${locale}.json`);
    return await response.json();
}

export function generateName() {
    return names[Math.floor(Math.random() * names.length)];
}

(async function init() {
    names = await fetchNames(locale);
})()