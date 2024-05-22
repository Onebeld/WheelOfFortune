export class Timer extends EventTarget {
    constructor() {
        super();

        this.timeRemaining = 0;
        this.interval = null;
    }

    start(duration) {
        this.timeRemaining = duration;

        this.interval = setInterval(() => {
            if (this.timeRemaining <= 0) {
                this.stop();
                this.dispatchEvent(new Event("end"));
            } else {
                this.timeRemaining--;
                this.dispatchEvent(new Event('tick'))
            }
        }, 1000);
    }

    stop() {
        clearInterval(this.interval);
        this.interval = null;
        this.dispatchEvent(new Event('stop'));
    }

    reset() {
        this.stop();
        this.timeRemaining = 0;
        this.dispatchEvent(new Event('reset'));
    }
}