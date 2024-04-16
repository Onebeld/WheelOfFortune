import {wheel} from "./wheel.js";
import {Letters} from "./letters.js";
import {HtmlTemplates} from "./templates.js";

import {Player} from "./players/player.js";
import {Bot} from "./players/bot.js";

const GameMode = { NO_BOTS: "no_bots", WITH_BOTS: "with_bots" };
const Round = {
    FIRST: "first",
    SECOND: "second",
    THIRD: "third",
    FOURTH: "fourth",

    SUPER_GAME: "super_game"
};

class Letter {
    constructor(letter) {
        this.letter = letter;
        this.isSelected = false;
    }
}

const letters = Letters.RU;

const letterBoard = document.querySelector("#letters");
const playerBoard = document.querySelector("#players");
const titleTourElement = document.querySelector(".title-tour");
const taskElement = document.querySelector("#task");

const maxPlayers = 3;

let letterBlocks = [];
let players = [];

let winningPlayers = [];

let isYourTurn = true;
let currentGameMode = GameMode.NO_BOTS;
let currentRound;

let currentPlayer = 0;

function createLetterBoard() {
    for (let i = 0; i < letters.length; i++) {
        const letter = new Letter(letters[i]);

        const letterElement = HtmlTemplates.getLetterElement();
        const letterText = letterElement.querySelector(".letter");

        letterText.textContent = letter.letter;

        const observer = new Proxy(letter, {
            set(target, prop, value) {
                if (prop === "isSelected") {
                    letterText.textContent = "NO";
                    return true;
                }

                return false;
            }
        });

        letterElement.addEventListener("click", () => {
            if (!isYourTurn) return;

            observer.isSelected = true;
            isYourTurn = false;
        })

        letterBlocks.push( { letterElement, observer } );

        letterBoard.appendChild(letterElement);
    }
}

function createPlayer(player) {
    const playerName = player.element.querySelector(".player-name");
    const playerPoints = player.element.querySelector(".player-points");

    playerName.textContent = player.name;
    playerPoints.textContent = player.points;

    const observer = new Proxy(player, {
        set(target, prop, value) {
            if (prop === "points") {
                playerPoints.textContent = value;
                return true;
            }

            return false;
        }
    });

    players.push( observer );

    playerBoard.appendChild(player.element);
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

function beginSelectingLetter(player, points) {
    // TODO: Select letter
}

function nextMove() {
    if (currentPlayer >= players.length - 1) {
        currentPlayer = 0;
    }
    else {
        currentPlayer++;
    }

    if (typeof players[currentPlayer] !== Bot) {
        isYourTurn = true;
    }
}

function nextRound() {
    // TODO: Finish round
}

function startGame(gameMode) {
    currentGameMode = gameMode;
    currentRound = Round.FIRST;

    createLetterBoard();
    createPlayerBoard();
}

function clearGame() {
    players = [];
    letterBlocks = [];

    playerBoard.clear();
    letterBoard.clear();
}

function eventRotatedWheel(index, sector) {
    const player = players[currentPlayer];

    switch (sector) {
        case "0":
            player.points = 0;

            nextMove();
            break;

        default:
            beginSelectingLetter(player, parseInt(sector));

            break;
    }
}

wheel.addEventListener("rotated", (event) => {
    const index = event.detail.index;
    const sector = event.detail.sector;

    eventRotatedWheel(index, sector);
});

(function init() {
    currentGameMode = GameMode.NO_BOTS;
})()