class Wheel extends EventTarget{
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

    rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    getIndex() {
        return Math.floor(this.lastAngle / this.sectorAngle);
    }

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
    "400",
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
    "П",
    "600",
    "350",
    "300",
    "200",
    "500",
    "600",
    "400",
    "М",
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
