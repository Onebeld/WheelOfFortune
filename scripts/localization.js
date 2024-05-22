class Localization {
    static DEFAULT_LOCALE = "en";
    static ARGUMENT_KEY = "translate";
    static PATH = "assets/localization/";
    static LOCALES = ["en", "ru"];

    constructor() {
        this.browserLocale = navigator.language.split("-")[0];
        this.locale = null;
        this.translations = {};
    }

    /**
     * Initializes the localization settings by setting the locale and loading translations.
     */
    async init() {
        this.setLocale(this.browserLocale);
        await this.loadTranslations(this.locale);
        this.translatePage();
    }

    /**
     * Sets the locale of the document to the specified new locale, if it is included in the list of supported locales.
     * If the new locale is not supported, the default locale is used instead.
     *
     * @param {string} newLocale - The new locale to set.
     */
    setLocale(newLocale) {
        this.locale = Localization.LOCALES.includes(newLocale) ? newLocale : Localization.DEFAULT_LOCALE;
        document.documentElement.lang = this.locale;
    }

    /**
     * Fetches translations for a given locale from the server.
     *
     * @param {string} locale - The locale for which translations are fetched.
     * @return {Promise<Object>} A promise that resolves to the JSON object containing the translations.
     */
    async loadTranslations(locale) {
        const response = await fetch(`${Localization.PATH}${locale}.json`);
        this.translations = await response.json();
    }

    /**
     * Translates the entire page by finding all elements with the specified attribute and calling the translateElement function for each of them.
     */
    translatePage() {
        document.querySelectorAll(`[${Localization.ARGUMENT_KEY}]`).forEach(element => this.translateElement(element));
    }

    /**
     * Translates a single element by setting its inner text based on a key attribute.
     *
     * @param {Element} element - The element to be translated.
     */
    translateElement(element) {
        const key = element.getAttribute(Localization.ARGUMENT_KEY);
        element.innerText = this.translations[key];
    }

    /**
     * Translates a string by replacing keys with values from translations using Regex.
     *
     * @param {string} string - The string to be translated.
     * @return {string} The translated string with replaced keys.
     */
    translateString(string) {
        return string.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
            return this.translations[key.trim()] || match;
        });
    }
}

const localization = new Localization();
localization.init();

export { localization };