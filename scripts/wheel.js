class Wheel extends EventTarget{
    /**
     * Initializes a new instance of the Wheel class.
     *
     * @param {Array} sectors - The sectors of the wheel.
     * @param {Array} colors - The colors of the sectors.
     * @param {string} canvasId - The ID of the canvas element.
     */
    constructor(sectors, colors, canvasId) {
        super();

        this.sectors = sectors;
        this.colors = colors;
        this.canvasWheel = document.getElementById(canvasId).getContext("2d");
        this.diameter = this.canvasWheel.canvas.width;
        this.radius = this.diameter / 2;
        this.radian = Math.PI / 180;
        this.sectorAngle = 360 / this.sectors.length;
        this.angle = 0;
        this.lastAngle = 0;
        this.isRotating = false;
    }

    /**
     * Generates a random number between min (inclusive) and max (exclusive).
     *
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     * @return {number} A random number within the specified range.
     */
    rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    /**
     * Calculates the index of the wheel sector based on the last angle and sector angle.
     *
     * @return {number} The index of the wheel sector.
     */
    getIndex() {
        return Math.floor(this.lastAngle / this.sectorAngle);
    }

    /**
     * Draws a sector on the canvas with a given angle and color.
     *
     * @param {string} sector - the text to be displayed on the sector
     * @param {number} i - the index of the sector
     */
    draw(sector, i) {
        const angle = this.sectorAngle * i;

        this.canvasWheel.save();

        const color = this.colors[i % this.colors.length];

        // Sector
        this.canvasWheel.beginPath();
        this.canvasWheel.fillStyle = color.sector;
        this.canvasWheel.moveTo(this.radius, this.radius);
        this.canvasWheel.arc(this.radius, this.radius, this.radius, angle * this.radian, (angle + this.sectorAngle) * this.radian);
        this.canvasWheel.lineTo(this.radius, this.radius);
        this.canvasWheel.fill();

        // Border
        this.canvasWheel.lineWidth = 1;
        this.canvasWheel.strokeStyle = "#2a2e88";
        this.canvasWheel.stroke();

        // Text
        this.canvasWheel.translate(this.radius, this.radius);
        this.canvasWheel.rotate((angle + this.sectorAngle) * this.radian);
        this.canvasWheel.textAlign = "right";
        this.canvasWheel.fillStyle = color.text;
        this.canvasWheel.font = "bold 12px sans-serif";
        this.canvasWheel.fillText(sector, this.radius - 6, -10);

        this.canvasWheel.restore();
    }

    /**
     * Draws empty sectors on the canvas.
     *
     * This function iterates over a specified number of empty sectors and
     * draws them on the canvas. Each empty sector is represented by a colored
     * arc with a border. The color of each empty sector is determined by the
     * colors array in the current instance of the class.
     *
     * @return {void} This function does not return a value.
     */
    drawEmptySectors() {
        const emptySectors = 12;
        const emptySectorAngle = 360 / emptySectors;

        for (let i = 0; i < emptySectors; i++) {
            const angle = 10 + (emptySectorAngle * i);

            this.canvasWheel.save();

            // Color
            this.canvasWheel.beginPath();
            this.canvasWheel.fillStyle = this.colors[i % this.colors.length].sector;
            this.canvasWheel.moveTo(this.radius, this.radius);
            this.canvasWheel.arc(this.radius, this.radius, this.radius - 35, angle * this.radian, (angle + emptySectorAngle) * this.radian);
            this.canvasWheel.lineTo(this.radius, this.radius);
            this.canvasWheel.fill();

            // Border
            this.canvasWheel.lineWidth = 1;
            this.canvasWheel.strokeStyle = "#2a2e88";
            this.canvasWheel.stroke();

            this.canvasWheel.restore();
        }
    }

    /**
     * Handles the click event on the wheel.
     *
     * This function is called when the user clicks on the wheel. It checks if the wheel is already rotating and returns early if it is. Otherwise, it sets the `isRotating` flag to true and generates a random angle within the range of 1000 to 2000.
     *
     * The function then creates an array of keyframes for the rotation animation. Each keyframe specifies the transform property with the current angle.
     *
     * An options object is created with the duration set to 7000 milliseconds, fill set to 'forwards', and easing set to 'ease-in-out'.
     *
     * The function creates an animation using the `animate` method on the `canvasWheel.canvas` element, passing in the keyframes and options.
     *
     * An `onfinish` callback is assigned to the animation. This callback is executed when the animation finishes. Inside the callback, the `isRotating` flag is set to false, the `lastAngle` is updated to the current angle modulo 360, and the `transform` style of the `canvasWheel.canvas` element is set to the rotated angle.
     *
     * Finally, a custom event called "rotated" is dispatched with the index and sector details as the event details.
     */
    eventClickWheel() {
        if (this.isRotating) return;

        this.isRotating = true;

        this.angle = this.rand(1000, 2000);

        let keyFrames = [
            { transform: `rotate(-${this.lastAngle}deg)` },
            { transform: `rotate(-${this.angle}deg)` }
        ]

        let options = {
            duration: 7000,
            fill: 'forwards',
            easing: 'ease-in-out'
        }

        let animation = this.canvasWheel.canvas.animate(keyFrames, options);
        animation.onfinish = () => {
            this.isRotating = false;
            this.lastAngle = this.angle % 360;
            this.canvasWheel.canvas.style.transform = `rotate(${this.lastAngle}deg)`;

            const rotated = new CustomEvent("rotated", {
                detail: {
                    index: this.getIndex(),
                    sector: this.sectors[this.getIndex()]
                }
            });

            this.dispatchEvent(rotated);
        }
    }

    /**
     * Rotates the wheel.
     */
    rotate() {
        this.eventClickWheel.bind(this);
    }

    /**
     * Initializes the wheel by drawing the sectors, drawing empty sectors, and adding event listeners.
     */
    initWheel() {
        // Drawing sectors
        this.sectors.forEach((sector, index) => this.draw(sector, index));
        this.drawEmptySectors();

        // Events
        this.canvasWheel.canvas.addEventListener("click", this.eventClickWheel.bind(this));
    }
}

const sectors = [
    "350",
    "600",
    "+",
    "B",
    "700",
    "600",
    "x2",
    "600",
    "500",
    "400",
    "650",
    "450",
    "0",
    "1000",
    "500",
    "350",
    "550",
    "750",
    "600",
    "500",
    "350",
    "400",
    "x2",
    "600",
    "500",
    "P",
    "600",
    "350",
    "300",
    "0",
    "500",
    "600",
    "400",
    "B",
    "500",
    "350",
    "600",
    "400",
    "450",
    "500"
];

const colors = [
    { sector: "#fff", text: "#2a2e88" },
    { sector: "#2a2e88", text: "#fff" }
];

const wheel = new Wheel(sectors, colors, "wheel");
wheel.initWheel();

export { wheel };
