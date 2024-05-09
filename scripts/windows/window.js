export class Window {
    constructor(window) {
        this.element = window;
    }

    show() {
        this.element.classList.remove("closed");
    }

    close() {
        this.element.classList.add("closed");
    }
}