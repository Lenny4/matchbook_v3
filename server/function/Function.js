"use strict";

function findIndexOfNumbers(array) {
    const idxs = [];
    for (let i = array.length - 1; i >= 0; i--) {
        if (typeof array[i] === "string" && array[i] !== "time") {
            idxs.unshift(i);
        }
    }
    return idxs;
}

const Function = {
    formatData(fields, runner, reduceTo1 = false, indexToFlat = [], numberFlat = 100) {
        let data = [];
        runner.prices.forEach((price) => {

            const backPrices = price.value.filter(x => x.side === "back");
            if (Array.isArray(backPrices) && backPrices.length > 0) {
                const currentMaxOddBack = backPrices.reduce((prev, current) => {
                    return (prev.odds > current.odds) ? prev : current
                }).odds;
                const arrayRunner = [price.time, currentMaxOddBack, null];

                if (fields[3] === "availableAmount1") {
                    let currentAvailableAmount1 = null;
                    if ("0" in backPrices) currentAvailableAmount1 = backPrices[0]["available-amount"];
                    arrayRunner.push(currentAvailableAmount1);
                }
                if (fields[4] === "availableAmount2") {
                    let currentAvailableAmount2 = null;
                    if ("1" in backPrices) currentAvailableAmount2 = backPrices[1]["available-amount"];
                    arrayRunner.push(currentAvailableAmount2);
                }
                if (fields[5] === "availableAmount3") {
                    let currentAvailableAmount3 = null;
                    if ("2" in backPrices) currentAvailableAmount3 = backPrices[2]["available-amount"];
                    arrayRunner.push(currentAvailableAmount3);
                }
                if (fields[6] === "availableAmount4") {
                    let currentAvailableAmount4 = null;
                    if ("3" in backPrices) currentAvailableAmount4 = backPrices[3]["available-amount"];
                    arrayRunner.push(currentAvailableAmount4);
                }

                data.push(arrayRunner);
            }
        });

        data = [fields].concat(data);
        if (reduceTo1 === true) {
            const numbersIndex = findIndexOfNumbers(data[0]);
            numbersIndex.forEach((i) => {
                let max = 1;
                data.forEach((array, index) => {
                    if (index > 0) {
                        if (array[i] > max) {
                            max = array[i];
                        }
                        array[i] = array[i] / max;
                    }
                });
            });
        }
        if (indexToFlat.length > 0) {
            for (let nbFlat = 0; nbFlat < numberFlat; nbFlat++) {
                for (let i = 0; i < data.length; i++) {
                    if (i > 0) {
                        indexToFlat.forEach((thisIndexToFlat) => {
                            if (i === 1) {
                                data[i][thisIndexToFlat] = ((data[i][thisIndexToFlat] * 2) + data[i + 1][thisIndexToFlat]) / 3;
                            } else if (i === data.length - 1) {
                                data[i][thisIndexToFlat] = ((data[i][thisIndexToFlat] * 2) + data[i - 1][thisIndexToFlat]) / 3;
                            } else {
                                data[i][thisIndexToFlat] = ((data[i][thisIndexToFlat] * 2) + data[i + 1][thisIndexToFlat] + data[i - 1][thisIndexToFlat]) / 4;
                            }
                        });
                    }
                }
            }
        }
        return data;
    },

    findTopAndBottom(data, runnerName, event) {
        const bets = [];

        let lastTopBottom = "";
        let nbBackOddGoUp = 0;
        // triangle | square | diamond | diamond | star | polygon | circle
        let shape = null;

        //region params
        const paramsTimeStartBet = -1800;

        let goingUp1 = false;
        let paramsGoingUp1_1 = 0.9;
        let paramsGoingUp1_2 = 1;
        //endregion

        data.forEach((array, index) => {
            const time = array[0];
            if (time > paramsTimeStartBet) {
                let nameBet = null;
                const backOdd = array[1];
                const availableAmount1 = array[3];
                const availableAmount2 = array[4];
                const availableAmount3 = array[5];
                const availableAmount4 = array[6];

                let goingUp = false;
                let goingDown = false;

                if (backOdd > data[index - 1][1]) {
                    nbBackOddGoUp++;
                }

                //region goingUp1
                /**
                 * dans le cas ou availableAmount2 >= backOdd && availableAmount3 >= backOdd
                 * et que availableAmount2 et availableAmount3 sont en train de monter
                 * dès qu'ils repassent en dessous de backOdd, si le availableAmount1 n'est pas allé au dessus de backOdd
                 * pendant que availableAmount2 && availableAmount3 étaient au dessus de backOdd
                 * on fait un back dès que la côte augmente 2 fois de suite et si availableAmount2 et availableAmount3 sont
                 * au moins 0.9 égale à backOdd
                 */
                const currentAvailableAmount2_3UpperBackOdd = availableAmount2 >= backOdd && availableAmount3 >= backOdd;
                if (currentAvailableAmount2_3UpperBackOdd
                    && (availableAmount2 > data[index - 1][4] && availableAmount3 > data[index - 1][5])
                    && goingUp1 === false) {
                    goingUp1 = true;
                }
                if (!currentAvailableAmount2_3UpperBackOdd && goingUp1 === true) {
                    let i = index;
                    while (!(data[i][4] >= data[i][1] && data[i][5] >= data[i][1])) {
                        i -= 1;
                    }
                    while (data[i][4] >= data[i][1] && data[i][5] >= data[i][1]) {
                        if (data[i][3] >= data[i][1]) {
                            goingUp1 = false;
                            break;
                        }
                        i -= 1;
                    }
                }
                if (
                    goingUp1 === true
                    && (nbBackOddGoUp >= paramsGoingUp1_2)
                    && ((availableAmount2 / backOdd < paramsGoingUp1_1) && (availableAmount3 / backOdd) < paramsGoingUp1_1)
                ) {
                    goingUp1 = false;
                    nameBet = "goingUp1";
                    goingUp = true;
                    shape = "triangle";
                }
                //endregion

                //region goingUp2
                /**
                 * si availableAmount2 > backOdd && availableAmount4 > backOdd
                 */
                if (availableAmount2 > backOdd && availableAmount4 > backOdd) {
                    goingUp = true;
                    nameBet = "goingUp2";
                    shape = "square";
                }
                //endregion

                //region closingGoingUp

                //endregion

                const betLay = goingUp && lastTopBottom !== "lay";
                const betBack = goingDown && lastTopBottom !== "back";

                if (betLay || betBack) {
                    lastTopBottom = this.placeBet(lastTopBottom, event, time, nameBet, runnerName, goingUp, goingDown, bets, shape);
                }

                if (backOdd < data[index - 1][1]) {
                    nbBackOddGoUp = 0;
                }
            }
        });
        return bets;
    },

    placeBet(lastTopBottom, event, time, nameBet, runnerName, goingUp, goingDown, bets, shape) {
        const bet = {
            side: null,
            time: time,
            name: nameBet,
            color: null,
            shape: shape,
            value: null,
        };
        const price = event.markets.runners.find(runner => runner.name === runnerName).prices.find(price => price.time === time).value;
        if (goingUp && lastTopBottom !== "lay") {
            const layValue = price.filter(x => x.side === "lay" && x['available-amount'] >= 50).reduce((prev, current) => {
                return (prev.odds < current.odds) ? prev : current
            }).odds;
            lastTopBottom = "lay";
            bet.side = "lay";
            bet.color = "red";
            bet.value = layValue;
            bets.push(bet);
        }
        if (goingDown && lastTopBottom !== "back") {
            const backValue = price.filter(x => x.side === "back" && x['available-amount'] >= 50).reduce((prev, current) => {
                return (prev.odds > current.odds) ? prev : current
            }).odds;
            lastTopBottom = "back";
            bet.side = "back";
            bet.color = "blue";
            bet.value = backValue;
            bets.push(bet);
        }
        return lastTopBottom;
    },
};

module.exports = Function;
