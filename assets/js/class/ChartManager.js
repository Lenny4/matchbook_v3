"use strict";
const clone = require('clone');
const randomstring = require("randomstring");

class ChartManager {
    constructor(socket, app) {
        this.app = app;
        this.socket = socket;
        this.pointLabel = {'type': 'string', 'role': 'style'};
        this.pointValueUp = "point { size: 12; shape-type: star; fill-color: black; }";
        this.pointValueDown = "point { size: 12; shape-type: star; fill-color: red; }";
        this.options = {
            title: null,
            curveType: 'function',
            legend: {position: 'bottom'},
            height: 580,
            width: 1340,
            pointSize: 1,
            dataOpacity: 1,
            // chartArea: {left: 50, top: 1, width: "90%", height: "85%"},
            // series: {
            //     0: {color: '#43459d'},
            //     1: {color: '#e2431e'},
            //     2: {color: '#e2431e'},
            //     3: {color: '#e2431e'},
            //     4: {color: '#e2431e'},
            //     5: {color: '#6f9654'},
            // }
        };
    }

    createCharts(match) {
        const result = [];

        //region create charts
        match.markets.runners.forEach((runner) => {
            const fieldsBack = [['time', runner.name, this.pointLabel, "availableAmount1", "availableAmount2", "availableAmount3", "availableAmount4"]];
            const dataBack = [];

            const fieldsBack2 = [['time', runner.name]];
            const dataBack2 = [];

            runner.prices.forEach((price) => {

                const backPrices = price.value.filter(x => x.side === "back");
                if (Array.isArray(backPrices) && backPrices.length > 0) {
                    const currentMaxOddBack = backPrices.reduce((prev, current) => {
                        return (prev.odds > current.odds) ? prev : current
                    }).odds;

                    let currentAvailableAmount1 = null;
                    if ("0" in backPrices) currentAvailableAmount1 = backPrices[0]["available-amount"];

                    let currentAvailableAmount2 = null;
                    if ("1" in backPrices) currentAvailableAmount2 = backPrices[1]["available-amount"];

                    let currentAvailableAmount3 = null;
                    if ("2" in backPrices) currentAvailableAmount3 = backPrices[2]["available-amount"];

                    let currentAvailableAmount4 = null;
                    if ("3" in backPrices) currentAvailableAmount4 = backPrices[3]["available-amount"];

                    dataBack.push([price.time, currentMaxOddBack, null, currentAvailableAmount1, currentAvailableAmount2, currentAvailableAmount3, currentAvailableAmount4]);
                    dataBack2.push([price.time, currentMaxOddBack]);
                }
            });
            const dataFormatedArray = this.formatData(fieldsBack.concat(dataBack), true, [3, 4, 5, 6], 400);
            const dataFormatedArray2 = this.formatData(fieldsBack2.concat(dataBack2));

            this.findTopAndBottom(dataFormatedArray, runner.name);

            this.addChartToDisplayChart(result, runner.name, dataFormatedArray2);
            this.addChartToDisplayChart(result, runner.name, dataFormatedArray);
        });
        //endregion

        return result;
    }

    findTopAndBottom(data, runnerName) {
        let lastTopBottom = null;
        let nbBackOddGoUp = 0;

        let goingUp1 = false;

        data.forEach((array, index) => {
            if (index > 1000) {
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
                 * dès qu'ils repassent en dessous de backOdd, si le availableAmount1 n'est pas allé au dessus de backOdd
                 * sur les 100 dernière secondes
                 * on fait un back dès que la côte augmente 2 fois de suite
                 */
                if (
                    (availableAmount2 >= backOdd && availableAmount3 >= backOdd)
                    && goingUp1 === false
                ) {
                    goingUp1 = true;
                    for (let i = index; i >= index - 100; i--) {
                        if (data[i][3] > backOdd) {
                            goingUp1 = false;
                            break;
                        }
                    }
                }
                if (
                    goingUp1 === true
                    && (nbBackOddGoUp >= 2)
                    && (backOdd > data[index - 1][1])
                ) {
                    goingUp1 = false;
                    goingUp = true;
                }
                //endregion

                //region goingUp2
                /**
                 * si availableAmount2 > backOdd && availableAmount4 > backOdd
                 */
                if (availableAmount2 > backOdd && availableAmount4 > backOdd) {
                    goingUp = true;
                }
                //endregion

                //region goingDown1
                /**
                 * si availableAmount1 > backOdd && availableAmount2 > backOdd && availableAmount3 < backOdd
                 */
                if (availableAmount1 > backOdd && availableAmount2 > backOdd && availableAmount3 < backOdd) {
                    goingDown = true;
                }
                //endregion

                if (goingUp && lastTopBottom !== "up") {
                    array[2] = this.pointValueUp;
                    lastTopBottom = "up";
                }
                if (goingDown && lastTopBottom !== "bottom") {
                    array[2] = this.pointValueDown;
                    lastTopBottom = "bottom";
                }

                if (backOdd < data[index - 1][1]) {
                    nbBackOddGoUp = 0;
                }
            }
        });
    }

    displayChart(eventId) {
        const match = this.app.matchs.find(x => parseInt(x.eventId) === parseInt(eventId));
        console.log(match);
        //get chart data
        const charts = this.createCharts(match);
        charts.forEach((data) => {
            //create div to display chart
            const chartDivId = randomstring.generate();
            $("<div id='" + chartDivId + "'></div>").appendTo(".event");
            const pie_1_chart = new GoogleCharts.api.visualization.LineChart(document.getElementById(chartDivId));

            //get the options
            const options = this.getOptions();
            options.title = data.title;

            //draw chart
            pie_1_chart.draw(data.chart, options);
        });
    }

    addChartToDisplayChart(result, title, data) {
        result.push({
            title: title,
            chart: GoogleCharts.api.visualization.arrayToDataTable(data),
        });
    }

    formatData(data, reduceTo1 = false, indexToFlat = [], numberFlat = 100) {
        if (reduceTo1 === true) {
            const numbersIndex = this.findIndexOfNumbers(data[0]);
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
    }

    findIndexOfNumbers(array) {
        const idxs = [];
        for (let i = array.length - 1; i >= 0; i--) {
            if (typeof array[i] === "string" && array[i] !== "time") {
                idxs.unshift(i);
            }
        }
        return idxs;
    }

    getOptions() {
        return clone(this.options);
    }
}

module.exports = ChartManager;
