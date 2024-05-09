export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function removeAllChildrenFromElement(element) {
    while (element.firstChild)
        element.removeChild(element.firstChild);
}

export class Global {
    static currentSector;
    static currentRound;
    static currentPlayer = -1;
}