import {wheel} from "./wheel.js";
import {Letters} from "./letters.js";
import {HtmlTemplates} from "./templates.js";
import {tasks} from "./task-manager.js";
import {Task} from "./elements/task.js";
import {Player} from "./players/player.js";
import {Bot} from "./players/bot.js";
import {Global, sleep} from "./general.js";
import {InputWordWindow} from "./windows/input-word-window.js";
import {localization} from "./localization.js";

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

class Game {
    constructor() {
        this.letters = (localization.browserLocale === "ru") ? Letters.RU : Letters.EN;
        this.letterBlocks = [];
        this.players = [];
        this.winningPlayers = [];
        this.canTurnWheel = false;
        this.currentGameMode = GameMode.NO_BOTS;
        this.currentPoints = 0;
        this.currentSector = null;
        this.inputWordWindow = null;
        this.numberOfPlayers = 1;

        // For super game
        this.selectedLettersSupergame = [];
        this.supergameCountLetters = 0;

        this.setupElements();
        this.addEventListeners();
    }

    setupElements() {
        this.letterBoard = document.querySelector("#letters");
        this.lettersContainer = document.querySelector(".letters-container");
        this.playerBoard = document.querySelector("#players");
        this.wheelOfFortune = document.querySelector("#wheel-of-fortune");
        this.taskContainer = document.querySelector(".task-container");
        this.wordWindow = document.querySelector("#word-window");
        this.nameWordButton = document.querySelector("#name-word-button");
        this.gameMenu = document.querySelector(".game-menu");
        this.startGameNobots = document.querySelector("#start-game-nobots");
        this.startGameBots = document.querySelector("#start-game-bots");

        this.task = new Task(this.taskContainer);
    }

    addEventListeners() {
        this.nameWordButton.addEventListener("click", async () => this.openInputWindow());

        wheel.addEventListener("rotated", async (event) => {
            const index = event.detail.index;
            this.currentSector = event.detail.sector;
            await this.eventRotatedWheel(index, this.currentSector);
        });

        wheel.canvasWheel.canvas.addEventListener("click", () => {
            this.nameWordButton.setAttribute("disabled", true);
        });

        this.startGameBots.addEventListener("click", async () => {
            await this.startGame(GameMode.WITH_BOTS);
            this.gameMenu.classList.add("hidden");
        });

        this.startGameNobots.addEventListener("click", async () => {
            await this.startGame(GameMode.NO_BOTS);
            this.gameMenu.classList.add("hidden");
        });

        this.wordWindow.querySelector("button#input-close-button").addEventListener("click", () => this.closeInputWindow());
        this.wordWindow.querySelector("button#input-answer-button").addEventListener("click", () => this.answerInputWindow());
    }

    openWindow(window) {
        window.classList.remove("closed");
        this.canTurnWheel = false;
        this.turnWheel();
    }

    closeWindow(window) {
        window.classList.add("closed");
        this.canTurnWheel = true;
        this.turnWheel();
    }

    createLetterBoard() {
        for (const letter of this.letters) {
            const letterObj = new Letter(letter);
            const letterElement = HtmlTemplates.getLetterElement();

            const letterText = letterElement.querySelector(".letter");
            const svg = letterElement.querySelector("svg");

            letterText.textContent = letterObj.letter;

            const observer = new Proxy(letterObj, {
                set(target, prop, value) {
                    if (prop === "isSelected") {
                        target.isSelected = value;
                        if (value) svg.classList.remove("hidden");
                        else svg.classList.add("hidden");
                        return true;
                    }
                    return false;
                }
            });

            letterElement.addEventListener("click", () => {
                if (observer.isSelected) return;

                if (Global.currentRound === Round.SUPER_GAME) {
                    observer.isSelected = true;

                    this.selectedLettersSupergame.push(observer.letter);

                    if (this.selectedLettersSupergame.length === this.supergameCountLetters) {
                        this.lettersContainer.classList.add("disabled");
                        setTimeout(() => this.selectLetterSuperGame(), 500);
                    }

                    return;
                }

                this.lettersContainer.classList.add("disabled");
                observer.isSelected = true;
                setTimeout(() => this.selectLetter(observer.letter), 500);
            });

            this.letterBlocks.push({ letterElement, observer });
            this.letterBoard.appendChild(letterElement);
        }
    }

    createPlayer(player) {
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

                    if (value)
                        player.element.classList.add("can-move");
                    else
                        player.element.classList.remove("can-move");

                    return true;
                }
                if (prop === "loses") {
                    target.loses = value;

                    if (value)
                        player.element.classList.add("loses");
                    else
                        player.element.classList.remove("loses");

                    return true;
                }
                return false;
            }
        });

        this.players.push(observer);
        this.playerBoard.appendChild(player.element);
    }

    createPlayerBoard() {
        if (this.currentGameMode === GameMode.NO_BOTS) {
            if (Global.currentRound === Round.FINAL || Global.currentRound === Round.SUPER_GAME) {
                for (const winningPlayer of this.winningPlayers) {
                    this.players.push(winningPlayer);
                    this.playerBoard.appendChild(winningPlayer.element);
                }
                this.winningPlayers = [];

                return;
            }
            for (let i = 0; i < 3; i++) {
                this.createPlayer(new Player("", this.numberOfPlayers++));
            }
        } else {
            this.createPlayer(new Player(`Player 1`, this.numberOfPlayers++));
            for (let i = 1; i < 3; i++) {
                this.createPlayer(new Bot("", this.numberOfPlayers++));
            }
        }
    }

    async selectLetter(letter) {
        this.lettersContainer.classList.remove("opened");
        const player = this.players[Global.currentPlayer];
        let hasLetter = false;

        await sleep(400);

        if (this.task.wordLetterElements.some(wordElement => wordElement.observer.letter === letter)) {
            await this.task.typeLeadingText(`{{game.leading.openLetter}}${letter}!`);
            await sleep(500);
        }

        for (const wordLetterElement of this.task.wordLetterElements) {
            if (wordLetterElement.observer.letter === letter) {
                wordLetterElement.observer.isOpened = true;
                hasLetter = true;

                player.points += (this.currentSector === "x2") ? player.points : this.currentPoints;

                await sleep(400);
            }
        }

        if (!hasLetter) {
            await this.task.typeLeadingText("{{game.leading.noLetter}}");
            await sleep(1000);
            await this.nextMove();

            return;
        }

        await sleep(400);
        if (this.task.wordLetterElements.every(wordElement => wordElement.observer.isOpened)) {
            this.winningPlayers.push(player);
            await this.nextRound();

            return;
        }

        this.task.typeLeadingText(`${player.name}{{game.leading.spinWheel}}`);

        this.canTurnWheel = true;
        this.turnWheel();
    }

    async selectLetterSuperGame() {
        this.lettersContainer.classList.remove("opened");

        await sleep(400);

        await this.task.typeLeadingText(`{{game.leading.openLettersIfExist}}`);

        for (const letter of this.task.wordLetterElements) {
            if (this.selectedLettersSupergame.includes(letter.observer.letter)) {
                letter.observer.isOpened = true;
                await sleep(400);
            }
        }

        await sleep(400);

        await this.task.typeLeadingText(`{{game.leading.minute}}`);

        this.inputWordWindow = new InputWordWindow(this.wordWindow, this.task.wordLetterElements, true);
        this.inputWordWindow.timer.addEventListener("end", async () => {
            this.closeWindow(this.wordWindow);
            this.inputWordWindow.timer = null;

            await sleep(400);

            await this.task.typeLeadingText(`{{game.leading.timesUp}}`);
            await sleep(2000);

            this.endGame();
        })

        this.openWindow(this.wordWindow);
    }

    async sayWord(word) {
        if (Global.currentRound === Round.SUPER_GAME) {
            if (this.task.currentTask.word !== word) {
                await this.task.typeLeadingText(`{{game.leading.wrongWordSuperGame}}`);
                
                await sleep(2000);
                this.endGame();

                return;
            }

            await this.task.typeLeadingText(`{{game.leading.yes}}`);

            await sleep(400);

            for (const wordLetterElement of this.task.wordLetterElements) {
                wordLetterElement.observer.isOpened = true;
                await sleep(400);
            }

            await this.task.typeLeadingText(`{{game.leading.winner}}`);

            await sleep(2000);

            this.endGame();

            return;
        }

        if (this.task.currentTask.word !== word) {
            await this.task.typeLeadingText(`{{game.leading.wrongWord}}`);
            await sleep(500);
            this.players[Global.currentPlayer].loses = true;
            this.nextMove();
            return;
        }

        await this.task.typeLeadingText(`{{game.leading.yes}}`);

        await sleep(400);

        for (const wordLetterElement of this.task.wordLetterElements) {
            wordLetterElement.observer.isOpened = true;
            await sleep(400);
        }

        this.nextRound();
    }

    async beginSelectingLetter(player, points) {
        this.currentPoints = points;
        if (!(player instanceof Bot)) {
            this.lettersContainer.classList.remove("disabled");
            this.lettersContainer.classList.add("opened");
            this.canTurnWheel = false;
            this.turnWheel();
        } else {
            player.makeMove();
        }
    }

    turnWheel() {
        if (this.canTurnWheel) {
            this.nameWordButton.removeAttribute("disabled");
            this.wheelOfFortune.classList.remove("disabled");
        } else {
            this.nameWordButton.setAttribute("disabled", true);
            this.wheelOfFortune.classList.add("disabled");
        }
    }

    async nextMove() {
        if (Global.currentPlayer >= 0)
            this.players[Global.currentPlayer].canMove = false;

        const playersIsEmpty = this.players.every(lose => lose.loses)

        if (playersIsEmpty && Global.currentRound === Round.FINAL) {
            await this.task.typeLeadingText(`{{game.leading.noPlayersFinal}}`);
            await sleep(2000);

            this.endGame();

            return;
        }

        if (playersIsEmpty) {
            await this.task.typeLeadingText(`{{game.leading.noPlayers}}`);

            await this.nextRound();

            return;
        }

        do {
            Global.currentPlayer = (Global.currentPlayer >= this.players.length - 1) ? 0 : Global.currentPlayer + 1;
        } while (this.players[Global.currentPlayer].loses);

        this.players[Global.currentPlayer].canMove = true;
        this.task.typeLeadingText(`${this.players[Global.currentPlayer].name}{{game.leading.spinWheel}}`);

        if (!(this.players[Global.currentPlayer] instanceof Bot)) {
            this.canTurnWheel = true;
            this.turnWheel();
        } else {
            await sleep(500);
            wheel.rotate();
        }
    }

    selectTasks() {
        const taskIndexes = [];
        while (taskIndexes.length < 4) {
            const index = Math.floor(Math.random() * tasks.length);
            if (!taskIndexes.includes(index)) taskIndexes.push(index);
        }
        this.currentTasks = taskIndexes.map(index => tasks[index]);
    }

    async nextRound() {
        let player;

        if (!this.players.every(lose => lose.loses)) {
            player = this.players[Global.currentPlayer];

            if (Global.currentRound === Round.FINAL) {
                await this.task.typeLeadingText(`{{game.leading.winning}}`);
            } else {
                await this.task.typeLeadingText(`{{game.leading.winning}} ${player.name}{{game.leading.nextRound}}`);
            }
        }

        await sleep(2000);

        if (player !== undefined)
        {
            player.canMove = false;
            this.winningPlayers.push(player);
        }

        this.clearGame();

        if (this.currentGameMode === GameMode.NO_BOTS) {
            Global.currentRound = (Global.currentRound === Round.FINAL) ? Round.SUPER_GAME : Global.currentRound + 1;
        } else {
            Global.currentRound = (Global.currentRound === Round.FINAL) ? Round.SUPER_GAME : Round.FINAL;
        }

        this.task.nextRound();
        this.createLetterBoard();
        this.createPlayerBoard();

        if (Global.currentRound === Round.SUPER_GAME) {
            this.task.task.innerText = "";
            this.startSuperGame();
        } else {
            setTimeout(() => this.task.typeTaskText(), 500);
            await this.nextMove();
        }
    }

    async startGame(gameMode) {
        this.currentGameMode = gameMode;
        Global.currentRound = Round.FIRST;
        this.task.beginNewGame();
        this.createLetterBoard();
        this.createPlayerBoard();
        setTimeout(() => this.task.typeTaskText(), 500);
        await this.nextMove();
    }

    endGame() {
        this.clearGame();
        this.winningPlayers = [];
        this.gameMenu.classList.remove("hidden");
    }

    async startSuperGame() {
        await this.task.typeLeadingText(`{{game.superGame}}!`);
        await sleep(1000);

        this.task.typeLeadingText(`{{game.leading.superGame}}`);
        await this.task.typeTaskText();

        await sleep(400);

        const guessableLetters = this.calculateGuessableLetters(this.task.currentTask.word);
        this.supergameCountLetters = guessableLetters;

        this.task.typeLeadingText(`{{game.leading.anyLetter}} ${guessableLetters}`);

        this.lettersContainer.classList.remove("disabled");
        this.lettersContainer.classList.add("opened");
    }

    calculateGuessableLetters(word) {
        const totalLetters = word.length;

        return Math.floor(totalLetters * 0.45);
    }

    removeAllChildrenFromElement(element) {
        while (element.firstChild) element.removeChild(element.firstChild);
    }

    clearGame() {
        this.players = [];
        this.letterBlocks = [];
        Global.currentPlayer = -1;
        this.task.clear();
        this.removeAllChildrenFromElement(this.playerBoard);
        this.removeAllChildrenFromElement(this.letterBoard);
    }

    async eventRotatedWheel(index, sector) {
        const player = this.players[Global.currentPlayer];
        switch (sector) {
            case "0":
                await this.task.typeLeadingText(`{{game.leading.zero}}`);
                await sleep(1000);
                await this.nextMove();
                break;
            case "B":
                player.points = 0;
                await this.task.typeLeadingText(`{{game.leading.bankrupt}}`);
                await sleep(1000);
                await this.nextMove();
                break;
            case "+":
                await this.task.typeLeadingText(`{{game.leading.plus}}`);
                break;
            case "P":
                await this.task.typeLeadingText(`{{game.leading.prize}}`);
                break;
            default:
                this.task.typeLeadingText(`${sector} {{game.leading.points}}`);
                await this.beginSelectingLetter(player, parseInt(sector));
                break;
        }
    }

    closeInputWindow() {
        this.closeWindow(this.wordWindow);
    }

    async answerInputWindow() {
        this.closeWindow(this.wordWindow);
        await sleep(300);

        if (this.inputWordWindow.timer !== undefined) {
            this.inputWordWindow.timer.stop();
            this.inputWordWindow.timer = null;
        }

        this.sayWord(this.inputWordWindow.getWord());
    }

    openInputWindow() {
        this.inputWordWindow = new InputWordWindow(this.wordWindow, this.task.wordLetterElements);
        this.openWindow(this.wordWindow);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new Game();
});
