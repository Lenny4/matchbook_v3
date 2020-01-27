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

    findTopAndBottom(data, runnerName) {
        const bets = [];

        let lastTopBottom = null;
        let nbBackOddGoUp = 0;

        let goingUp1 = false;

        data.forEach((array, index) => {
            if (index > 1000) {
                let nameBet = null;
                const time = array[0];
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
                 * on fait un back dès que la côte augmente 2 fois de suite
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
                    && (nbBackOddGoUp >= 2)
                    && (backOdd > data[index - 1][1])
                ) {
                    goingUp1 = false;
                    nameBet = "goingUp1";
                    goingUp = true;
                }
                //endregion

                //region goingUp2
                /**
                 * si availableAmount2 > backOdd && availableAmount4 > backOdd
                 */
                if (availableAmount2 > backOdd && availableAmount4 > backOdd) {
                    goingUp = true;
                    nameBet = "goingUp2";
                }
                //endregion

                //region goingDown1
                /**
                 * si availableAmount1 > backOdd && availableAmount2 > backOdd && availableAmount3 < backOdd
                 */
                if (availableAmount1 > backOdd && availableAmount2 > backOdd && availableAmount3 < backOdd) {
                    goingDown = true;
                    nameBet = "goingDown";
                }
                //endregion

                const bet = {
                    side: null,
                    time: time,
                    name: nameBet,
                };

                if (goingUp && lastTopBottom !== "lay") {
                    lastTopBottom = "lay";
                    bet.side = "lay";
                    bets.push(bet);
                }
                if (goingDown && lastTopBottom !== "back") {
                    lastTopBottom = "back";
                    bet.side = "back";
                    bets.push(bet);
                }

                if (backOdd < data[index - 1][1]) {
                    nbBackOddGoUp = 0;
                }
            }
        });
        return bets;
    }
};

module.exports = Function;