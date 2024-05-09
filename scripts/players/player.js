import {HtmlTemplates} from "../templates.js";
import {generateName} from "../name-generator.js";

export class Player {
    constructor(name, number) {
        if (name === "")
            this.name = generateName();
        else
            this.name = name;

        this.number = number;

        this.points = 0;

        this.loses = false;
        this.canMove = false;

        this.element = HtmlTemplates.getPlayerElement();
    }
}