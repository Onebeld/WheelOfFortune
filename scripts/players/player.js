import {HtmlTemplates} from "../templates.js";
import {generateName} from "../name-generator.js";

export class Player {
    constructor(name) {
        if (name === "")
            this.name = generateName();
        else
            this.name = name;

        this.points = 0;

        this.loses = false;
        this.canMove = false;

        this.element = HtmlTemplates.getPlayerElement();
    }
}