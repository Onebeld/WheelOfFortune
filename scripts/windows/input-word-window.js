import { Window } from "./window.js";
import { HtmlTemplates } from "../templates.js"
import { Timer } from "../timer.js";

export class InputWordWindow extends Window {
    constructor(window, wordLetterElements, superGame = false) {
        super(window);

        this.wordLetterElements = wordLetterElements;
        this.inputs = window.querySelector("div#word-inputs");
        this.closeButton = window.querySelector("button#input-close-button");
        this.answerButton = window.querySelector("button#input-answer-button");
        this.timerText = window.querySelector("#timer");
        this.timerT = window.querySelector("#timer-text");

        this.superGame = superGame;

        this.inputs.innerHTML = '';
        this.answerButton.disabled = true;

        this.createInputs();
        this.inputs.firstChild.focus();

        if (this.superGame) {
            this.timer = new Timer();

            this.timer.start(60);
            this.timerT.classList.remove("hidden");

            this.timerText.innerText = this.timer.timeRemaining;

            this.timer.addEventListener("tick", () => {
                this.timerText.innerText = this.timer.timeRemaining;
            });

            this.closeButton.style.display = "none";
        } else {
            this.timerT.classList.add("hidden");

            this.closeButton.style.display = "block";
        }
    }

    getWord() {
        let word = "";

        for (const input of this.inputs.children) {
            word += input.value.toLowerCase();
        }

        return word;
    }

    createInputs() {
        for (const worldLetterElement of this.wordLetterElements) {
            const input = HtmlTemplates.getInputLetterElement();

            if (worldLetterElement.observer.isOpened) {
                input.value = worldLetterElement.observer.letter;

                input.readOnly = true;
            }

            input.addEventListener('keyup', (e) => {
                let wrap = input.closest("div#word-inputs");
                let inputs = wrap.querySelectorAll("input");
                let value = input.value;

                let index = Array.prototype.indexOf.call(inputs, input);

                for (let i = 0; i < inputs.length; i++) {
                    if (inputs[i].value === '') {
                        this.answerButton.disabled = true;
                        break;
                    } else {
                        this.answerButton.disabled = false;
                    }
                }

                // Backspace
                if (e.key === "Backspace" || e.key === "Delete") {
                    if (!inputs[index].readOnly) {
                        input.value = '';
                    }

                    do {
                        index--;
                    } while (index > 0 && inputs[index].readOnly);

                    if (index >= 0)
                        inputs[index].focus();

                    return false;
                }

                if (!value.match(/^[a-zA-ZА-я]+$/)) {
                    input.value = '';
                    return false;
                }

                do {
                    index++;
                } while (index < inputs.length && inputs[index].readOnly);

                if (index < inputs.length)
                    inputs[index].focus();
            });

            this.inputs.appendChild(input);
        }
    }
}