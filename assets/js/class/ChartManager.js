"use strict";

class ChartManager {
    constructor(app) {
        this.app = app;
    }

    displayChart(eventId) {
        const match = this.app.matchs.find(x => parseInt(x.eventId) === parseInt(eventId));
        console.log(match);
    }
}

module.exports = ChartManager;