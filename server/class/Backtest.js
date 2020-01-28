"use strict";
const Const = require('../../Const');
const Function = require('../function/Function');

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

                        const backArray = Function.formatData(
                            ['time', runner.name, this.pointLabel],
                            runner);

                        const dataFormatedArray = Function.formatData(
                            ['time', runner.name, this.pointLabel, "backAmount1", "backAmount2", "backAmount3", "backAmount4"]
                            , runner, true, [3, 4, 5, 6], 400);

                        const bets = Function.findTopAndBottom(dataFormatedArray, runner.name, event);

                        runnerData.charts.push(dataFormatedArray);
                        runnerData.charts.push(backArray);
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