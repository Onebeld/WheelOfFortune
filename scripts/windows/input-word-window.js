import {Window} from "./window.js";
import {HtmlTemplates} from "../templates.js"

export class InputWordWindow extends Window {
    constructor(window, word) {
        super(window);

        this.word = word;
        this.inputs = window.querySelector("div#word-inputs");
        this.closeButton = window.querySelector("button#input-close-button");
        this.answerButton = window.querySelector("button#input-answer-button");

        this.inputs.innerHTML = '';
        this.answerButton.disabled = true;

        this.createInputs();
        this.inputs.firstChild.focus();
    }

    getWord() {
        let word = "";

        for (const input of this.inputs.children) {
            word += input.value.toLowerCase();
        }

        return word;
    }

    createInputs() {
        for (const letter of this.word) {
            const input = HtmlTemplates.getInputLetterElement();

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
                    input.value = '';

                    if (index - 1 >= 0) {
                        inputs[index - 1].focus();
                    }

                    return false;
                }

                if (!value.match(/^[a-zA-ZА-я]+$/)) {
                    input.value = '';
                    return false;
                }


                if (index + 1 < inputs.length) {
                    inputs[index + 1].focus();
                }
            });

            this.inputs.appendChild(input);
        }
    }
}