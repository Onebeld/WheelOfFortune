import { Player } from "./player.js";

export class Bot extends Player {
    constructor(name) {
        super(name);
    }

    makeMove(openLetterCount, wordLength) {
        if (openLetterCount === 0) {
            return "letter"
        } else if (openLetterCount / wordLength < 0.7) {
            if (Math.random() < 0.1) {
                return "word";
            } else {
                return "letter";
            }
        } else {
            return "word";
        }
    }
}