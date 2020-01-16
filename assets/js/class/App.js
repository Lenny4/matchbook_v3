"use strict";

const match_1 = require('../../../matchs/1');
// const match_2 = require('../../../matchs/2');
// const match_3 = require('../../../matchs/3');
// const match_4 = require('../../../matchs/4');
// const match_5 = require('../../../matchs/5');
// const match_6 = require('../../../matchs/6');
// const match_7 = require('../../../matchs/7');
// const match_8 = require('../../../matchs/8');

class App {
    constructor() {
        this.matchs = [];
    }

    init() {
        this.matchs.push(match_1);
        // this.matchs.push(match_2);
        // this.matchs.push(match_3);
        // this.matchs.push(match_4);
        // this.matchs.push(match_5);
        // this.matchs.push(match_6);
        // this.matchs.push(match_7);
        // this.matchs.push(match_8);
        console.log(this.matchs);
    }
}

module.exports = App;