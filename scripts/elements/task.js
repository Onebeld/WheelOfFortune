import {sleep, removeAllChildrenFromElement} from "../general.js";
import {tasks} from "../task-manager.js";
import {HtmlTemplates} from "../templates.js";
import {Global} from "../general.js";

const Round = {
    FIRST: 0,
    SECOND: 1,
    THIRD: 2,
    FINAL: 3,

    SUPER_GAME: 5
};

class WordLetter {
    constructor(letter) {
        this.letter = letter;
        this.isOpened = false;
    }
}

export class Task {
    constructor(element) {
        this.typingSpeed = 25;
        this.wordLetterElements = [];
        this.gameSessionTasks = [];
        this.currentTask = null;
        this.taskIndex = -1;

        this.element = element;

        this.titleRound = this.element.querySelector(".title-tour");
        this.word = this.element.querySelector("#word");
        this.task = this.element.querySelector("#task");
        this.leading = this.element.querySelector("#leading");
    }

    async typeLeadingText(text) {
        return await this.typeText(this.leading, translateString(text));
    }

    async typeTaskText() {
        console.log(this.currentTask);
        return await this.typeText(this.task, this.currentTask.task);
    }

    setTextRound(currentRound) {
        switch (currentRound) {
            case Round.FIRST:
                this.titleRound.textContent = translateString("{{game.firstRound}}");
                break;
            case Round.SECOND:
                this.titleRound.textContent = translateString("{{game.secondRound}}");
                break;
            case Round.THIRD:
                this.titleRound.textContent = translateString("{{game.thirdRound}}");
                break;
            case Round.FINAL:
                this.titleRound.textContent = translateString("{{game.final}}");
                break;

            case Round.SUPER_GAME:
                this.titleRound.textContent = translateString("{{game.superGame}}");
                break;
        }
    }

    async selectLetterPlusSector(currentPlayer, currentSector, letter) {
        for (const wordLetterElement of this.wordLetterElements) {
            if (wordLetterElement.observer.letter === letter) {
                wordLetterElement.observer.isOpened = true;

                if (currentSector === "x2")
                    currentPlayer.points *= 2;
                else
                    currentPlayer.points += this.textToNumber(currentSector);

                await sleep(400);
            }
        }
    }

    clear() {
        this.wordLetterElements = [];

        removeAllChildrenFromElement(this.word);
    }

    beginNewGame() {
        this.selectTasks();
        this.setTextRound(Global.currentRound);
        this.createWordLetters();
    }

    nextRound() {
        this.selectNextTask();
        this.setTextRound(Global.currentRound);
        this.createWordLetters();
    }

    textToNumber(text) {
        return parseInt(text);
    }

    selectNextTask() {
        this.taskIndex++;
        this.currentTask = this.gameSessionTasks[this.taskIndex];
    }

    selectTasks() {
        const taskIndexes = [];

        while (taskIndexes.length < 4) {
            const index = Math.floor(Math.random() * tasks.length);

            if (!taskIndexes.includes(index))
                taskIndexes.push(index);
        }

        this.gameSessionTasks = taskIndexes.map(index => tasks[index]);
        this.taskIndex = 0;
        this.currentTask = this.gameSessionTasks[this.taskIndex];
    }

    typeText(element, text) {
        return new Promise(resolve => {
            element.textContent = "";

            let index = 0;

            const timer = setInterval(() => {
                if (index < text.length) {
                    element.textContent += text[index];
                    index++;
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, this.typingSpeed);
        });
    }

    createWordLetters() {
        for (let i = 0; i < this.currentTask.word.length; i++) {
            const wordLetter = new WordLetter(this.currentTask.word[i].toUpperCase());

            const wordLetterElement = HtmlTemplates.getWordLetterElement();
            const spanLetter = wordLetterElement.querySelector("span.letter");

            spanLetter.textContent = wordLetter.letter;

            const observer = new Proxy(wordLetter, {
                set(target, prop, value) {
                    if (prop === "isOpened") {
                        target.isOpened = value;

                        if (value)
                            spanLetter.classList.remove("hidden");
                        else
                            spanLetter.classList.add("hidden");

                        return true;
                    }

                    return false;
                }
            });

            wordLetterElement.addEventListener("click", async () => {
                if (Global.currentSector !== "+") return;

                await this.selectLetterPlusSector(wordLetter.letter);
            });

            this.wordLetterElements.push( { wordLetterElement, observer } );

            this.word.appendChild(wordLetterElement);
        }
    }
}