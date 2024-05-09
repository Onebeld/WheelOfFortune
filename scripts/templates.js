export class HtmlTemplates {
    static {}

    /**
     * Creates an HTML element from the given HTML string.
     *
     * @param {string} html - The HTML string to convert into an element.
     * @param {boolean} [trim=true] - Whether to trim whitespace from the HTML string.
     * @return {HTMLElement|NodeList} The created HTML element or a NodeList of created elements.
     */
    static createElementFromHTML(html, trim = true) {
        html = trim ? html.trim() : html;
        if (!html) return null;

        const template = document.createElement('template');
        template.innerHTML = html;
        const result = template.content.children;

        if (result.length === 1) return result[0];
        return result;
    }

    /**
     * Generates the HTML element for a player in the game.
     *
     * @return {HTMLElement} The player element.
     */
    static getPlayerElement() {
        const template = `
            <div class="card player-card">
                <h3 class="player-name">Player 1</h3>
                
                <div class="card player-image">
                    <img src="assets/images/Player.png" width="100px" height="100px" alt="Player">
                    
                    <div class="player-number-container">
                        <span class="player-number"></span>
                    </div>
                </div>
                
                <p class="player-points">00000</p>
            </div>
        `;

        return this.createElementFromHTML(template);
    }

    /**
     * Generates the HTML element for a word letter card.
     *
     * @return {HTMLElement} The created HTML element.
     */
    static getWordLetterElement() {
        const template = `
            <div class="card letter-card">
                <span class="letter hidden"></span>
            </div>
        `;

        return this.createElementFromHTML(template);
    }

    static getInputLetterElement() {
        const template = `
            <input class="card letter-card input-word-letter" type="text" maxlength="1">
        `;

        return this.createElementFromHTML(template);
    }

    /**
     * Generates the HTML element for a letter card.
     *
     * @return {HTMLElement} The created HTML element.
     */
    static getLetterElement() {
        const template = `
            <div class="card letter-card letter-board">
                <span class="letter"></span>
                
                <svg class="mark hidden" height="30" width="30" xmlns="http://www.w3.org/2000/svg">
                    <circle r="13" cx="15" cy="15" stroke="red" stroke-width="3" fill-opacity="0" />
                </svg>
            </div>
        `;

        return this.createElementFromHTML(template);
    }
}