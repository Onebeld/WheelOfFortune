const DEFAULT_LOCALE = "en";
const ARGUMENT_KEY = "translate";
const PATH = "assets/localization/";

const LOCALES = [
    "en",
    "ru"
];

const browserLocale = navigator.language.split("-")[0];

let locale;

let translations = {};

/**
 * Sets the locale of the document to the specified new locale, if it is included in the list of supported locales.
 * If the new locale is not supported, the default locale is used instead.
 *
 * @param {string} newLocale - The new locale to set.
 */
function setLocale(newLocale) {
    locale = LOCALES.includes(newLocale) ? newLocale : DEFAULT_LOCALE;

    document.documentElement.lang = locale;
}

/**
 * Fetches translations for a given locale from the server.
 *
 * @param {string} locale - The locale for which translations are fetched.
 * @return {Promise<Object>} A promise that resolves to the JSON object containing the translations.
 */
async function fetchTranslations(locale) {
    const response = await fetch(`${PATH}${locale}.json`);
    return await response.json();
}

/**
 * Translates the entire page by finding all elements with the specified attribute and calling the translateElement function for each of them.
 */
function translatePage() {
    document.querySelectorAll(`[${ARGUMENT_KEY}]`).forEach(translateElement);
}

/**
 * Translates a single element by setting its inner text based on a key attribute.
 *
 * @param {Element} element - The element to be translated.
 */
function translateElement(element) {
    const key = element.getAttribute(ARGUMENT_KEY);
    element.innerText = translations[key];
}

/**
 * Translates a string by replacing keys with values from translations using Regex.
 *
 * @param {string} string - The string to be translated.
 * @return {string} The translated string with replaced keys.
 */
function translateString(string) {
    // From {{key}} to text from translations with Regex
    return string.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        // Если ключ найден в translations, возвращаем соответствующий перевод
        return translations[key.trim()] || match;
    });
}

document.addEventListener("DOMContentLoaded", async () => {
    translations = await fetchTranslations(locale);
    translatePage();
});

(function _init() {
    setLocale(browserLocale)
})();