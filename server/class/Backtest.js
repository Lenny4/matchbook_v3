"use strict";
const Const = require('../../Const');
const Function = require('../function/Function');

function getRaceName(name) {
    return (name.split(' ')[1]).toString();
}

function getHour(name) {
    return parseInt(name.split(' ')[0].split(':')[0]);
}

function getWeekday(start) {
    return new Date(start).getDay();
}

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
                        raceName: getRaceName(event.name),
                        hour: getHour(event.name),
                        weekday: getWeekday(event.start),
                        nbBets: 0,
                        gain: 0,
                        json: [],
                    };
                    event.markets.runners.forEach((runner, indexRunner) => {
                        const runnerData = {
                            name: runner.name,
                            charts: [],
                            gain: 0,
                            bets: null,
                        };

                        const backArray = Function.formatData(
                            ['time', runner.name, this.pointLabel],
                            runner);

                        const dataFormatedArray = Function.formatData(
                            ['time', runner.name, this.pointLabel, "backAmount1", "backAmount2", "backAmount3", "backAmount4"]
                            , runner, true, [3, 4, 5, 6], 400);

                        const bets = Function.findTopAndBottom(dataFormatedArray, runner.name, event);
                        const gain = Function.getGain(bets);

                        cleanEvent.nbBets += bets.length;
                        cleanEvent.gain += gain;

                        runnerData.charts.push(dataFormatedArray);
                        runnerData.charts.push(backArray);
                        runnerData.bets = bets;
                        runnerData.gain = gain;

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

    backTestAll(callback) {
        this.mySql.getAllEventIdWithNoCleanEvent((eventIds) => {
            console.log(eventIds.length + " a backtest");
            this.backTestEvents(eventIds, 0, () => {
                callback();
            });
        });
    }

    backTestEvents(eventIds, index, callback) {
        if (index === eventIds.length - 1) {
            callback();
        } else {
            console.log(parseInt((index / eventIds.length) * 10000) / 100 + "%");
            let eventId = eventIds[index];
            if (typeof eventId !== "string") eventId = eventId.eventId;
            this.getCleanEvent(eventId, (result) => this.backTestEvents(eventIds, (index + 1), callback));
        }
    }
}

module.exports = Backtest;
