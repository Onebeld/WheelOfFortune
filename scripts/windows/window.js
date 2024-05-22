export class Window extends EventTarget {
    constructor(window) {
        super();

        this.element = window;
    }

    show() {
        this.element.classList.remove("closed");
    }

    close() {
        this.element.classList.add("closed");
    }
}