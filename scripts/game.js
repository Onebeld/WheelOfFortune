import {wheel} from "./wheel.js";
import {Letters} from "./letters.js";
import {HtmlTemplates} from "./templates.js";
import {tasks, loadTasks} from "./task-manager.js";

import {Player} from "./players/player.js";
import {Bot} from "./players/bot.js";

const GameMode = { NO_BOTS: "no_bots", WITH_BOTS: "with_bots" };
const Round = {
    FIRST: 0,
    SECOND: 1,
    THIRD: 2,
    FINAL: 3,

    SUPER_GAME: 5
};

const typingSpeed = 25;

class Letter {
    constructor(letter) {
        this.letter = letter;
        this.isSelected = false;
    }
}

class WordLetter {
    constructor(letter) {
        this.letter = letter;
        this.isOpened = false;
    }
}

let letters;

if (browserLocale === "ru")
    letters = Letters.RU;
else
    letters = Letters.EN;

const letterBoard = document.querySelector("#letters");
const word = document.querySelector("#word");
const lettersContainer = document.querySelector(".letters-container");
const playerBoard = document.querySelector("#players");
const titleTourElement = document.querySelector(".title-tour");
const taskElement = document.querySelector("#task");
const wheelOfFortune = document.querySelector("#wheel-of-fortune");
const leading = document.querySelector("#leading");

const gameMenu = document.querySelector(".game-menu");
const startGameNobots = document.querySelector("#start-game-nobots");
const startGameBots = document.querySelector("#start-game-bots");

const maxPlayers = 3;

let letterBlocks = [];
let wordLetterElements = [];
let players = [];

let winningPlayers = [];
let currentTasks = [];
let taskIndex = -1;
let roundTask;

let canTurnWheel = false;
let currentGameMode = GameMode.NO_BOTS;
let currentRound;

let currentPoints = 0;
let currentSector;

let currentPlayer = -1;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function typeLeadingText(text) {
    leading.textContent = "";

    let index = 0;

    function type() {
        if (index < text.length) {
            leading.textContent += text[index];
            index++;
            setTimeout(type, typingSpeed);
        }
    }

    type();
}

function createLetterBoard() {
    for (let i = 0; i < letters.length; i++) {
        const letter = new Letter(letters[i]);

        const letterElement = HtmlTemplates.getLetterElement();
        const letterText = letterElement.querySelector(".letter");
        const svg = letterElement.querySelector("svg");

        letterText.textContent = letter.letter;

        const observer = new Proxy(letter, {
            set(target, prop, value) {
                if (prop === "isSelected") {
                    target.isSelected = value;

                    if (value)
                        svg.classList.remove("hidden");
                    else
                        svg.classList.add("hidden");

                    return true;
                }

                return false;
            }
        });

        letterElement.addEventListener("click", () => {
            if (observer.isSelected) return;

            lettersContainer.classList.add("disabled");
            observer.isSelected = true;

            setTimeout(() => { selectLetter(observer.letter); }, 500);
        })

        letterBlocks.push( { letterElement, observer } );

        letterBoard.appendChild(letterElement);
    }
}

function createWordLetters() {
    for (let i = 0; i < roundTask.word.length; i++) {
        const wordLetter = new WordLetter(roundTask.word[i].toUpperCase());

        const wordLetterElement = HtmlTemplates.getWordLetterElement();
        const spanLetter = wordLetterElement.querySelector("span.letter");

        spanLetter.textContent = wordLetter.letter;

        const observer = new Proxy(wordLetter, {
            set(target, prop, value) {
                if (prop === "isOpened") {
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
            if (currentSector !== "+") return;

            await selectLetterPlusSector(wordLetter.letter);
        });

        wordLetterElements.push( { wordLetterElement, observer } );

        word.appendChild(wordLetterElement);
    }
}

function createPlayer(player) {
    const playerName = player.element.querySelector(".player-name");
    const playerPoints = player.element.querySelector(".player-points");

    playerName.textContent = player.name;
    playerPoints.textContent = player.points.toString().padStart(5, "0");

    const observer = new Proxy(player, {
        set(target, prop, value) {
            if (prop === "points") {
                target.points = value;
                playerPoints.textContent = value.toString().padStart(5, "0");

                return true;
            }

            if (prop === "canMove") {
                target.canMove = value;

                if (value) {
                    player.element.classList.add("can-move");
                } else {
                    player.element.classList.remove("can-move");
                }

                return true;
            }

            return false;
        }
    });

    players.push( observer );

    playerBoard.appendChild(player.element);
}

function setTextRound() {
    switch (currentRound) {
        case Round.FIRST:
            titleTourElement.textContent = translateString("{{game.firstRound}}");
            break;
        case Round.SECOND:
            titleTourElement.textContent = translateString("{{game.secondRound}}");
            break;
        case Round.THIRD:
            titleTourElement.textContent = translateString("{{game.thirdRound}}");
            break;
        case Round.FINAL:
            titleTourElement.textContent = translateString("{{game.final}}");
            break;

        case Round.SUPER_GAME:
            titleTourElement.textContent = translateString("{{game.superGame}}");
            break;
    }
}

function createPlayerBoard() {
    if (currentGameMode === GameMode.NO_BOTS) {
        for (let i = 0; i < maxPlayers; i++) {
            createPlayer(new Player(`Player ${i + 1}`));
        }
    } else if (currentGameMode === GameMode.WITH_BOTS) {
        createPlayer(new Player(`Player 1`));

        for (let i = 1; i < maxPlayers; i++) {
            createPlayer(new Bot(`Bot ${i + 1}`));
        }
    }
}

async function selectLetterPlusSector(letter) {
    const player = players[currentPlayer];

    for (const wordLetterElement of wordLetterElements) {
        if (wordLetterElement.observer.letter === letter) {
            wordLetterElement.observer.isOpened = true;

            if (currentSector === "x2") {
                player.points *= 2;
            }
            else {
                player.points += currentPoints;
            }

            await sleep(400);
        }
    }

    if (wordLetterElements.every(wordElement => wordElement.observer.isOpened)) {
        // TODO: Winning
        winningPlayers.push(player);
        nextRound();
    }

    currentSector = "";

    canTurnWheel = true;
    turnWheel();
}

function selectLetter(letter) {
    lettersContainer.classList.remove("opened");

    const player = players[currentPlayer];

    setTimeout(async () => {
        let hasLetter = false;

        if (wordLetterElements.some(wordElement => wordElement.observer.letter === letter)) {
            typeLeadingText(translateString(`{{game.leading.openLetter}}${letter}!`));
            await sleep(1000);
        }

        for (const wordLetterElement of wordLetterElements) {
            if (wordLetterElement.observer.letter === letter) {
                wordLetterElement.observer.isOpened = true;
                hasLetter = true;

                if (currentSector === "x2") {
                    player.points *= 2;
                }
                else {
                    player.points += currentPoints;
                }

                await sleep(400);
            }
        }

        if (!hasLetter) {
            // TODO: Message about wrong letter
            typeLeadingText(translateString("{{game.leading.noLetter}}"));
            await sleep(1500);

            await nextMove();

            return;
        }

        await sleep(400);

        if (wordLetterElements.every(wordElement => wordElement.observer.isOpened)) {
            // TODO: Winning
            winningPlayers.push(player);
            nextRound();

            return;
        }

        typeLeadingText(translateString(`${players[currentPlayer].name}{{game.leading.spinWheel}}`));

        canTurnWheel = true;
        turnWheel();
    }, 500);
}

async function beginSelectingLetter(player, points) {
    currentPoints = points;

    // TODO: Select letter
    if (typeof player !== Bot) {
        lettersContainer.classList.remove("disabled");
        lettersContainer.classList.add("opened");

        canTurnWheel = false;
        turnWheel();
    }
    else {
        const move = player.makeMove();


    }
}

function turnWheel() {
    if (canTurnWheel)
        wheelOfFortune.classList.remove("disabled");
    else
        wheelOfFortune.classList.add("disabled");
}

async function nextMove() {
    if (currentPlayer >= 0) {
        players[currentPlayer].canMove = false;
    }

    if (currentPlayer >= players.length - 1) {
        currentPlayer = 0;
    }
    else {
        currentPlayer++;
    }

    players[currentPlayer].canMove = true;

    typeLeadingText(translateString(`${players[currentPlayer].name}{{game.leading.spinWheel}}`));

    if (typeof players[currentPlayer] !== Bot) {
        canTurnWheel = true;
        turnWheel();
    }
    else {
        await sleep(500);
        wheel.rotate();
    }
}

function selectTasks() {
    const taskIndexes = [];

    while (taskIndexes.length < 4) {
        const index = Math.floor(Math.random() * tasks.length);

        if (!taskIndexes.includes(index)) {
            taskIndexes.push(index);
        }
    }

    currentTasks = taskIndexes.map(index => tasks[index]);
}

function typeTask() {
    let index = 0;

    function type() {
        if (index < roundTask.task.length) {
            taskElement.textContent += roundTask.task[index];
            index++;
            setTimeout(type, typingSpeed);
        }
    }

    type();
}

function selectWord() {
    taskIndex++;

    roundTask = currentTasks[taskIndex];
}

async function nextRound() {
    clearGame();

    if (currentGameMode === GameMode.NO_BOTS) {
        switch (currentRound) {
            case Round.FIRST:
            case Round.SECOND:
            case Round.THIRD:
                currentRound++;
                break;

            case Round.FINAL:
                currentRound = Round.SUPER_GAME;
                break;
        }
    }
    else {
        switch (currentRound) {
            case Round.FIRST:
                currentRound = Round.FINAL;
                break;
            case Round.FINAL:
                currentRound = Round.SUPER_GAME;
                break;
        }
    }

    selectWord();

    setTextRound();

    createLetterBoard();
    createPlayerBoard();
    createWordLetters();

    setTimeout(typeTask, 500);
    await nextMove();

    // TODO: Finish round
}

async function startGame(gameMode) {
    currentGameMode = gameMode;

    selectTasks();
    selectWord();

    currentRound = Round.FIRST;

    setTextRound();

    createLetterBoard();
    createPlayerBoard();
    createWordLetters();

    setTimeout(typeTask, 500);
    await nextMove();
}

function clearGame() {
    players = [];
    letterBlocks = [];
    wordLetterElements = [];
    currentPlayer = -1;

    playerBoard.clear();
    letterBoard.clear();
    word.clear();
}

async function eventRotatedWheel(index, sector) {
    const player = players[currentPlayer];

    switch (sector) {
        case "0":
            typeLeadingText(translateString(`{{game.leading.zero}}`));
            await sleep(1000);

            await nextMove();
            break;
        case "Б":
            player.points = 0;

            typeLeadingText(translateString(`{{game.leading.bankrupt}}`));
            await sleep(1000);

            await nextMove();

            break;
        case "+":
            break;

        default:
            typeLeadingText(translateString(`${sector} {{game.leading.points}}`));
            await beginSelectingLetter(player, parseInt(sector));

            break;
    }
}

wheel.addEventListener("rotated", async (event) => {
    const index = event.detail.index;
    currentSector = event.detail.sector;

    await eventRotatedWheel(index, currentSector);
});

startGameBots.addEventListener("click", async () => {
    await startGame(GameMode.WITH_BOTS);

    gameMenu.classList.add("hidden");
});

startGameNobots.addEventListener("click", async () => {
    startGame(GameMode.NO_BOTS);

    gameMenu.classList.add("hidden");
});

(async function init() {
    await loadTasks();
})()