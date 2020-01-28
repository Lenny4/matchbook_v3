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

                if (fields[3] === "backAmount1") {
                    let currentBackAmount1 = null;
                    if ("0" in backPrices) currentBackAmount1 = backPrices[0]["available-amount"];
                    arrayRunner.push(currentBackAmount1);
                }
                if (fields[4] === "backAmount2") {
                    let currentBackAmount2 = null;
                    if ("1" in backPrices) currentBackAmount2 = backPrices[1]["available-amount"];
                    arrayRunner.push(currentBackAmount2);
                }
                if (fields[5] === "backAmount3") {
                    let currentBackAmount3 = null;
                    if ("2" in backPrices) currentBackAmount3 = backPrices[2]["available-amount"];
                    arrayRunner.push(currentBackAmount3);
                }
                if (fields[6] === "backAmount4") {
                    let currentBackAmount4 = null;
                    if ("3" in backPrices) currentBackAmount4 = backPrices[3]["available-amount"];
                    arrayRunner.push(currentBackAmount4);
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
        // triangle | square | diamond | diamond | star | circle | polygon (is for closing)
        let shape = null;

        //region params
        let paramsTimeStartBet = -1800;
        let gain = 0.10;
        let minAvailableAmount = 50;

        let goingUp1 = false;
        let paramsGoingUp1_1 = 0.9;
        let paramsGoingUp1_2 = 1;
        //endregion

        /**
         * g = gain en %
         * p = back/lay
         * g = (1-p) / p
         * p = 1 / (g+1)
         */
        const percentDiffClosing = 1 - (1 / (gain + 1));

        data.forEach((array, index) => {
            const time = array[0];
            if (time > paramsTimeStartBet) {
                let nameBet = null;
                const price = event.markets.runners.find(runner => runner.name === runnerName).prices.find(price => price.time === time).value;
                const backOdd = array[1];
                const backAmount1 = array[3];
                const backAmount2 = array[4];
                const backAmount3 = array[5];
                const backAmount4 = array[6];

                let goingUp = false;
                let goingDown = false;

                if (backOdd > data[index - 1][1]) {
                    nbBackOddGoUp++;
                }

                //region goingUp1
                /**
                 * dans le cas ou backAmount2 >= backOdd && backAmount3 >= backOdd
                 * et que backAmount2 et backAmount3 sont en train de monter
                 * dès qu'ils repassent en dessous de backOdd, si le backAmount1 n'est pas allé au dessus de backOdd
                 * pendant que backAmount2 && backAmount3 étaient au dessus de backOdd
                 * on fait un back dès que la côte augmente 2 fois de suite et si backAmount2 et backAmount3 sont
                 * au moins 0.9 égale à backOdd
                 */
                const currentBackAmount2_3UpperBackOdd = backAmount2 >= backOdd && backAmount3 >= backOdd;
                if (currentBackAmount2_3UpperBackOdd
                    && (backAmount2 > data[index - 1][4] && backAmount3 > data[index - 1][5])
                    && goingUp1 === false) {
                    goingUp1 = true;
                }
                if (!currentBackAmount2_3UpperBackOdd && goingUp1 === true) {
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
                    && ((backAmount2 / backOdd < paramsGoingUp1_1) && (backAmount3 / backOdd) < paramsGoingUp1_1)
                ) {
                    goingUp1 = false;
                    nameBet = "goingUp1";
                    goingUp = true;
                    shape = "triangle";
                }
                //endregion

                //region goingUp2
                /**
                 * si backAmount2 > backOdd && backAmount4 > backOdd
                 */
                if (backAmount2 > backOdd && backAmount4 > backOdd) {
                    goingUp = true;
                    nameBet = "goingUp2";
                    shape = "square";
                }
                //endregion

                //region goingDown1

                //endregion

                //region closingGoingUp
                if (bets.length > 0) {
                    const lastBet = bets[bets.length - 1];
                    if (lastBet.side === "lay") {
                        const betLayValue = lastBet.value;
                        const currentBackValue = this.getBackValue(price, minAvailableAmount);
                        if (currentBackValue >= betLayValue * (1 + percentDiffClosing)) {
                            goingDown = true;
                            nameBet = "closingUp";
                            shape = "polygon";
                        }
                    }
                }
                //endregion

                const betLay = goingUp && lastTopBottom !== "lay";
                const betBack = goingDown && lastTopBottom !== "back";

                if (betLay || betBack) {
                    lastTopBottom = this.placeBet(lastTopBottom, event, time, nameBet, runnerName, goingUp, goingDown, bets, shape, price, minAvailableAmount);
                }

                if (backOdd < data[index - 1][1]) {
                    nbBackOddGoUp = 0;
                }
            }
        });
        return bets;
    },

    placeBet(lastTopBottom, event, time, nameBet, runnerName, goingUp, goingDown, bets, shape, price, minAvailableAmount) {
        const bet = {
            side: null,
            time: time,
            name: nameBet,
            color: null,
            shape: shape,
            value: null,
        };
        if (goingUp && lastTopBottom !== "lay") {
            const layValue = this.getLayValue(price, minAvailableAmount);
            lastTopBottom = "lay";
            bet.side = "lay";
            bet.color = "red";
            bet.value = layValue;
            bets.push(bet);
        }
        if (goingDown && lastTopBottom !== "back") {
            const backValue = this.getBackValue(price, minAvailableAmount);
            lastTopBottom = "back";
            bet.side = "back";
            bet.color = "blue";
            bet.value = backValue;
            bets.push(bet);
        }
        return lastTopBottom;
    },

    getLayValue(price, minAvailableAmount) {
        return price.filter(x => x.side === "lay" && x['available-amount'] >= minAvailableAmount).reduce((prev, current) => {
            return (prev.odds < current.odds) ? prev : current
        }).odds;
    },

    getBackValue(price, minAvailableAmount) {
        return price.filter(x => x.side === "back" && x['available-amount'] >= minAvailableAmount).reduce((prev, current) => {
            return (prev.odds > current.odds) ? prev : current
        }).odds;
    }
};

module.exports = Function;
