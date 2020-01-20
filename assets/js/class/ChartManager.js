"use strict";
const clone = require('clone');
const randomstring = require("randomstring");
const regression = require("regression");

class ChartManager {
    constructor(app) {
        this.app = app;
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
            const fieldsBack = [['time', 'volume', runner.name, this.pointLabel]];
            const dataBack = [];

            runner.prices.forEach((price) => {
                const backPrices = price.value.filter(x => x.side === "back");
                const currentMaxOddBack = backPrices.reduce((prev, current) => {
                    return (prev.odds > current.odds) ? prev : current
                }).odds;

                const volume = this.getSommeVolume(price.value);

                dataBack.push([price.time, volume, currentMaxOddBack, null]);
            });
            const dataFormatedArray = this.formatData(fieldsBack.concat(dataBack), true, true, [1, 2], 400);
            this.findTopAndBottom(dataFormatedArray);
            this.addChartToDisplayChart(result, runner.name, dataFormatedArray);
        });
        //endregion

        return result;
    }

    findTopAndBottom(data) {
        let lastTopBottom = null;
        data.forEach((array, index) => {
            if (index > 0) {
                const time = array[0];
                const backOdd = array[1];

                const goingUp = (
                    (backOdd > 0.94 && lastTopBottom !== "up")
                );
                const goingDown = false;

                if (goingUp) {
                    array[2] = this.pointValueUp;
                    lastTopBottom = "up";
                }
                if (goingDown) {
                    array[2] = this.pointValueDown;
                    lastTopBottom = "bottom";
                }
            }
        });
    }

    displayChart(eventId) {
        const match = this.app.matchs.find(x => parseInt(x.eventId) === parseInt(eventId));
        //get chart data
        const charts = this.createCharts(match);
        charts.forEach((data) => {
            //create div to display chart
            const chartDivId = randomstring.generate();
            $("#match_" + match.eventId).append("<div id='" + chartDivId + "'></div>");
            const pie_1_chart = new GoogleCharts.api.visualization.LineChart(document.getElementById(chartDivId));

            //get the options
            const options = this.getOptions();
            options.title = data.title;

            //draw chart
            pie_1_chart.draw(data.chart, options);
        });
    }

    getSommeVolume(priceValues) {
        let amount = 0;
        priceValues.forEach((value) => {
            amount += value['available-amount'];
        });
        return amount;
    }

    addChartToDisplayChart(result, title, data) {
        result.push({
            title: title,
            chart: GoogleCharts.api.visualization.arrayToDataTable(data),
        });
    }

    formatData(data, reduceTo1 = false, reduceTo0 = false, indexToFlat = [], numberFlat = 100) {
        if (reduceTo1 === true || reduceTo0 === true) {
            const numbersIndex = this.findIndexOfNumbers(data[0]);
            numbersIndex.forEach((i) => {
                const min = data.reduce((prev, current) => {
                    return (prev[i] < current[i]) ? prev : current
                })[i];
                let max = data.reduce((prev, current) => {
                    return (prev[i] > current[i]) ? prev : current
                })[i];
                if (reduceTo0) max = max - min;
                data.forEach((array, index) => {
                    if (index > 0) {
                        if (reduceTo0) {
                            array[i] = array[i] - min;
                        }
                        if (reduceTo1) {
                            array[i] = array[i] / max;
                        }
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
