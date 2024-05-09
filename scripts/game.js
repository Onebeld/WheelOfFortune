import {wheel} from "./wheel.js";
import {Letters} from "./letters.js";
import {HtmlTemplates} from "./templates.js";
import {tasks} from "./task-manager.js";
import {Task} from "./elements/task.js";

import {Player} from "./players/player.js";
import {Bot} from "./players/bot.js";
import {sleep} from "./general.js";
import {Global} from "./general.js";
import {InputWordWindow} from "./windows/input-word-window.js";

const GameMode = { NO_BOTS: "no_bots", WITH_BOTS: "with_bots" };
const Round = {
    FIRST: 0,
    SECOND: 1,
    THIRD: 2,
    FINAL: 3,

    SUPER_GAME: 5
};

class Letter {
    constructor(letter) {
        this.letter = letter;
        this.isSelected = false;
    }
}

let letters;

if (browserLocale === "ru")
    letters = Letters.RU;
else
    letters = Letters.EN;

const letterBoard = document.querySelector("#letters");
const lettersContainer = document.querySelector(".letters-container");
const playerBoard = document.querySelector("#players");
const wheelOfFortune = document.querySelector("#wheel-of-fortune");
const taskContainer = document.querySelector(".task-container");

const wordWindow = document.querySelector("#word-window");

const nameWordButton = document.querySelector("#name-word-button");

const gameMenu = document.querySelector(".game-menu");
const startGameNobots = document.querySelector("#start-game-nobots");
const startGameBots = document.querySelector("#start-game-bots");

const maxPlayers = 3;

const task = new Task(taskContainer);

let letterBlocks = [];
let wordLetterElements = [];
let players = [];

let winningPlayers = [];
let currentTasks = [];

let canTurnWheel = false;
let currentGameMode = GameMode.NO_BOTS;

let currentPoints = 0;
let currentSector;

let numberOfPlayers = 1;

function openWindow(window) {
    window.classList.remove("closed");

    canTurnWheel = false;
    turnWheel();
}

function closeWindow(window) {
    window.classList.add("closed");

    canTurnWheel = true;
    turnWheel();
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

function createPlayer(player) {
    const playerName = player.element.querySelector(".player-name");
    const playerPoints = player.element.querySelector(".player-points");
    const playerNumber = player.element.querySelector(".player-number");

    playerName.textContent = player.name;
    playerPoints.textContent = player.points.toString().padStart(5, "0");
    playerNumber.textContent = player.number;

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

            if (prop === "loses") {
                target.loses = value;

                if (value) {
                    player.element.classList.add("loses");
                } else {
                    player.element.classList.remove("loses");
                }

                return true;
            }

            return false;
        }
    });

    players.push(observer);

    playerBoard.appendChild(player.element);
}

function createPlayerBoard() {
    if (currentGameMode === GameMode.NO_BOTS) {
        if (Global.currentRound === Round.FINAL) {
            for (const winningPlayer of winningPlayers) {
                players.push(winningPlayer);
                playerBoard.appendChild(winningPlayer.element);
            }

            winningPlayers = [];

            return;
        }

        for (let i = 0; i < maxPlayers; i++) {
            createPlayer(new Player("", numberOfPlayers++));
        }
    } else if (currentGameMode === GameMode.WITH_BOTS) {
        createPlayer(new Player(`Player 1`, numberOfPlayers++));

        for (let i = 1; i < maxPlayers; i++) {
            createPlayer(new Bot("", numberOfPlayers++));
        }
    }
}

function selectLetter(letter) {
    lettersContainer.classList.remove("opened");

    const player = players[Global.currentPlayer];

    setTimeout(async () => {
        let hasLetter = false;

        if (task.wordLetterElements.some(wordElement => wordElement.observer.letter === letter)) {
            await task.typeLeadingText(`{{game.leading.openLetter}}${letter}!`);

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
            await task.typeLeadingText("{{game.leading.noLetter}}");

            await sleep(1500);

            await nextMove();

            return;
        }

        await sleep(400);

        if (wordLetterElements.every(wordElement => wordElement.observer.isOpened)) {
            // TODO: Winning
            winningPlayers.push(player);
            await nextRound();

            return;
        }

        await task.typeLeadingText(`${players[Global.currentPlayer].name}{{game.leading.spinWheel}}`);

        canTurnWheel = true;
        turnWheel();
    }, 500);
}

async function sayWord(word) {
    if (task.currentTask.word !== word) {
        await task.typeLeadingText(`{{game.leading.wrongWord}}`);
        await sleep(500);

        players[Global.currentPlayer].loses = true;
    }
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
    if (Global.currentPlayer >= 0)
        players[Global.currentPlayer].canMove = false;

    do {
        if (Global.currentPlayer >= players.length - 1)
            Global.currentPlayer = 0;
        else
            Global.currentPlayer++;
    } while (players[Global.currentPlayer].loses);

    players[Global.currentPlayer].canMove = true;

    task.typeLeadingText(`${players[Global.currentPlayer].name}{{game.leading.spinWheel}}`);

    if (typeof players[Global.currentPlayer] !== Bot) {
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

async function nextRound() {
    const player = players[Global.currentPlayer];

    if (Global.currentRound === Round.FINAL)
        await task.typeLeadingText(`{{game.leading.winning}}`);
    else
        await task.typeLeadingText(`{{game.leading.winning}} ${player.name}{{game.leading.nextRound}}`);

    await sleep(2000);

    player.canMove = false;

    clearGame();

    if (currentGameMode === GameMode.NO_BOTS) {
        switch (Global.currentRound) {
            case Round.FIRST:
            case Round.SECOND:
            case Round.THIRD:
                Global.currentRound++;
                break;

            case Round.FINAL:
                Global.currentRound = Round.SUPER_GAME;
                break;
        }
    }
    else {
        switch (Global.currentRound) {
            case Round.FIRST:
                Global.currentRound = Round.FINAL;
                break;
            case Round.FINAL:
                Global.currentRound = Round.SUPER_GAME;
                break;
        }
    }

    task.nextRound();

    createLetterBoard();
    createPlayerBoard();

    if (Global.currentRound === Round.SUPER_GAME) {
        // TODO: Super game
        await task.typeLeadingText(`{{game.superGame}}!`);

        await sleep(2000);

        await task.typeLeadingText(`{{game.superGame}}!`);
    }
    else {
        setTimeout(() => task.typeTaskText(), 500);
        await nextMove();
    }

    // TODO: Finish round
}

async function startGame(gameMode) {
    currentGameMode = gameMode;
    Global.currentRound = Round.FIRST;

    task.beginNewGame();

    createLetterBoard();
    createPlayerBoard();

    setTimeout(() => task.typeTaskText(), 500);
    await nextMove();
}

function removeAllChildrenFromElement(element) {
    while (element.firstChild)
        element.removeChild(element.firstChild);
}

function clearGame() {
    players = [];
    letterBlocks = [];
    Global.currentPlayer = -1;

    task.clear();
    removeAllChildrenFromElement(playerBoard);
    removeAllChildrenFromElement(letterBoard);
}

async function eventRotatedWheel(index, sector) {
    const player = players[Global.currentPlayer];

    switch (sector) {
        case "0":
            await task.typeLeadingText(`{{game.leading.zero}}`);
            await sleep(1000);

            await nextMove();
            break;
        case "Б":
            player.points = 0;

            await task.typeLeadingText(`{{game.leading.bankrupt}}`);
            await sleep(1000);

            await nextMove();

            break;
        case "+":
            await task.typeLeadingText(`{{game.leading.plus}}`);

            break;
        case "П":
            await task.typeLeadingText(`{{game.leading.prize}}`);
            break;

        default:
            task.typeLeadingText(`${sector} {{game.leading.points}}`);
            await beginSelectingLetter(player, parseInt(sector));

            break;
    }
}

nameWordButton.addEventListener("click", async () => {
    const inputWordWindow = new InputWordWindow(wordWindow, task.currentTask.word);
    openWindow(wordWindow);

    inputWordWindow.closeButton.addEventListener("click", () => {
        closeWindow(wordWindow);
    });

    inputWordWindow.answerButton.addEventListener("click", async () => {
        closeWindow(wordWindow);

        await sleep(300);
        sayWord(inputWordWindow.getWord());
    });
})

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
    await startGame(GameMode.NO_BOTS);

    gameMenu.classList.add("hidden");
});