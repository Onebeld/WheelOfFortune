export class HtmlTemplates {
    static {}

    static createElementFromHTML(html, trim = true) {
        html = trim ? html.trim() : html;
        if (!html) return null;

        const template = document.createElement('template');
        template.innerHTML = html;
        const result = template.content.children;

        if (result.length === 1) return result[0];
        return result;
    }

    static getPlayerElement() {
        const template = `
            <div class="card player-card">
                <h3 class="player-name">Player 1</h3>
                
                <div class="card player-image">
                    <img src="assets/images/Player.png" width="100px" height="100px" alt="Player">
                </div>
                
                <p class="player-points">00000</p>
            </div>
        `;

        return this.createElementFromHTML(template);
    }

    static getWordLetterElement() {
        const template = `
            <div class="card letter-card letter-board">
                <span class="letter hidden"></span>
            </div>
        `;

        return this.createElementFromHTML(template);
    }

    static getLetterElement() {
        const template = `
            <div class="card letter-card letter-board">
                <span class="letter"></span>
            </div>
        `;

        return this.createElementFromHTML(template);
    }
}