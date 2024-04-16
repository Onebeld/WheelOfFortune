import {HtmlTemplates} from "../templates.js";

export class Player {
    constructor(name) {
        this.name = name;
        this.points = 0;

        this.loses = false;

        this.element = HtmlTemplates.getPlayerElement();
    }

    guessLetter() {

    }

    guessWord() {

    }
}