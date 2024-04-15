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
]

const colors = [
    { sector: "#fff", text: "#2a2e88" },
    { sector: "#2a2e88", text: "#fff" }
]

const wheel = document.getElementById("wheel").getContext('2d');

const rand = (min, max) => Math.random() * (max - min) + min;

const diameter = wheel.canvas.width;
const radius = diameter / 2;
const tau = Math.PI * 2;
const arc = tau / sectors.length;

let angle = 0;
let lastAngle = 0;
let isRotating = false;

const getIndex = () => Math.floor(sectors.length - (angle / tau) * sectors.length) % sectors.length;

function draw(sector, i) {
    const angle = arc * i;

    wheel.save();

    const color = colors[i % colors.length];

    // Color
    wheel.beginPath();
    wheel.fillStyle = color.sector;
    wheel.moveTo(radius, radius);
    wheel.arc(radius, radius, radius, angle, angle + arc);
    wheel.lineTo(radius, radius);
    wheel.fill();

    // Border
    wheel.lineWidth = 1;
    wheel.strokeStyle = "#2a2e88";
    wheel.stroke();

    // Text
    wheel.translate(radius, radius);
    wheel.rotate(angle + arc / 2);
    wheel.textAlign = "right";
    wheel.fillStyle = color.text;
    wheel.font = "bold 12px sans-serif";
    wheel.fillText(sector, radius - 6, 5);

    wheel.restore();
}

function drawEmptySectors() {
    const emptySectors = 12;

    const arc = tau / emptySectors

    for (let i = 0; i < emptySectors; i++) {
        const angle = arc * i;

        wheel.save();

        // Color
        wheel.beginPath();
        wheel.fillStyle = colors[i % colors.length].sector;
        wheel.moveTo(radius, radius);
        wheel.arc(radius, radius, radius - 35, angle, angle + arc);
        wheel.lineTo(radius, radius);
        wheel.fill();

        // Border
        wheel.lineWidth = 1;
        wheel.strokeStyle = "#2a2e88";
        wheel.stroke();

        wheel.restore();
    }
}

function rotate(angleToRotate) {
    wheel.canvas.style.transform = `rotate(${angleToRotate}deg)`;
}

function eventClickWheel() {
    if (isRotating) return;

    isRotating = true;

    angle = rand(1000, 2000);

    let keyFrames = [
        { transform: `rotate(${lastAngle}deg)` },
        { transform: `rotate(${angle}deg)` }
    ]

    let options = {
        duration: 7000,
        fill: 'forwards',
        easing: 'ease-in-out'
    }

    let animation = wheel.canvas.animate(keyFrames, options);
    animation.onfinish = function () {
        isRotating = false;

        lastAngle = angle % 360;

        wheel.canvas.style.transform = `rotate(${lastAngle}deg)`;

        console.log("Yes!");
    }
}

(function init() {
    // Drawing sectors
    sectors.forEach(draw);
    drawEmptySectors();

    // Events
    wheel.canvas.addEventListener("click", eventClickWheel);
})()