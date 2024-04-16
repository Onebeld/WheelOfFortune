import {Player} from "./player.js";

export class Bot extends Player {
    constructor(name) {
        super(name);
    }

    guessLetter() {

    }

    guessWord() {

    }

    makeMove() {
        let openLetterCount = 0;
        let wordLength = 0;

        if (openLetterCount === 0) {
            this.guessLetter();
        } else if (openLetterCount / wordLength < 0.5) {
            if (Math.random() < 0.1) {
                this.guessWord();
            } else {
                this.guessLetter();
            }
        } else {
            this.guessWord();
        }
    }
}