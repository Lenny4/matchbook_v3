"use strict";
const Const = require('../../Const');
const Function = require('../../function/Function');

class Backtest {
    constructor(mySql) {
        this.mySql = mySql;
        this.pointLabel = {'type': 'string', 'role': 'style'};
    }

    getCleanEvent(eventId, callback) {
        this.mySql.getCleanEvent(eventId, (cleanEvent) => {
            if (cleanEvent === undefined) {
                this.mySql.getEvent(eventId, (event) => {
                    event = JSON.parse(event.json);
                    const cleanEvent = {
                        eventId: event.eventId,
                        start: event.start,
                        name: event.name,
                        json: [],
                    };
                    event.markets.runners.forEach((runner, indexRunner) => {
                        const runnerData = {
                            name: runner.name,
                            charts: [],
                            bets: null,
                        };

                        const fieldsBack = ['time', runner.name, this.pointLabel, "availableAmount1", "availableAmount2", "availableAmount3", "availableAmount4"];
                        const fieldsBack2 = ['time', runner.name, this.pointLabel];

                        const dataFormatedArray = Function.formatData(fieldsBack, runner, true, [3, 4, 5, 6], 400);
                        const dataFormatedArray2 = Function.formatData(fieldsBack2, runner);

                        const bets = Function.findTopAndBottom(dataFormatedArray);

                        runnerData.charts.push(dataFormatedArray);
                        runnerData.charts.push(dataFormatedArray2);
                        runnerData.bets = bets;

                        cleanEvent.json.push(runnerData);
                    });
                    this.mySql.saveCleanEvent(cleanEvent, () => {
                        const returnEvent = {
                            json: cleanEvent,
                        };
                        callback(returnEvent);
                    });
                });
            } else {
                callback(cleanEvent);
            }
        });
    }
}

module.exports = Backtest;