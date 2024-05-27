import { Window } from "./window.js";
import { HtmlTemplates } from "../templates.js"

export class PriseWindow extends Window {
    constructor(window) {
        super(window);

        this.isSelectedPrise = false;
        this.prises = window.querySelector("#prises");
        this.priseText = window.querySelector(".prise-text");

        this.priseText.innerText = "";
        this.prises.innerHTML = "";

        this.generatePrises();
    }

    generatePrises() {
        const random = Math.random();

        const priseBox1 = HtmlTemplates.getPriseBoxElement();
        const priseBox2 = HtmlTemplates.getPriseBoxElement();

        if (random < 0.5) {
            priseBox1.addEventListener("click", (e) => {
                if (this.isSelectedPrise) return;

                this.loose(e.target);
            });
            priseBox2.addEventListener("click", (e) => {
                if (this.isSelectedPrise) return;

                this.win(e.target);
            });

            priseBox2.querySelector(".prise-open .material-symbols-rounded").innerText = "featured_seasonal_and_gifts";
            priseBox1.querySelector(".prise-open .material-symbols-rounded").innerText = "close";
        } else {
            priseBox1.addEventListener("click", (e) => {
                if (this.isSelectedPrise) return;

                this.win(e.target);
            });
            priseBox2.addEventListener("click", (e) => {
                if (this.isSelectedPrise) return;

                this.loose(e.target);
            });

            priseBox2.querySelector(".prise-open .material-symbols-rounded").innerText = "close";
            priseBox1.querySelector(".prise-open .material-symbols-rounded").innerText = "featured_seasonal_and_gifts";
        }

        this.prises.appendChild(priseBox1);
        this.prises.appendChild(priseBox2);
    }

    loose(target) {
        this.isSelectedPrise = true;

        target.classList.add("opened");

        const priseOpened = new CustomEvent("prise-opened", {
            detail: {
                isWin: false
            }
        });
        this.dispatchEvent(priseOpened);
    }

    win(target) {
        this.isSelectedPrise = true;

        target.classList.add("opened");

        const priseOpened = new CustomEvent("prise-opened", {
            detail: {
                isWin: true
            }
        });
        this.dispatchEvent(priseOpened);
    }
}