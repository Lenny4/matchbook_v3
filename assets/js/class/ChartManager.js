"use strict";
const clone = require('clone');
const randomstring = require("randomstring");

class ChartManager {
    constructor(app) {
        this.app = app;
        this.pointLabel = {'type': 'string', 'role': 'style'};
        this.pointValue = "point { size: 10; shape-type: star; fill-color: blue; }";
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
            const fieldsBack = [['time', runner.name, "availableAmount1", "availableAmount2", "availableAmount3", "availableAmount4"]];
            const dataBack = [];

            runner.prices.forEach((price) => {
                const backPrices = price.value.filter(x => x.side === "back");
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

                dataBack.push([price.time, currentMaxOddBack, currentAvailableAmount1, currentAvailableAmount2, currentAvailableAmount3, currentAvailableAmount4]);
            });

            this.addChartToDisplayChart(result, runner.name, fieldsBack.concat(dataBack), true, [2, 3, 4, 5], 400);
        });
        //endregion

        return result;
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

    addChartToDisplayChart(result, title, data, reduceTo1 = false, indexToFlat = [], numberFlat = 100) {
        if (reduceTo1 === true) {
            const numbersIndex = this.findIndexOfNumbers(data[1]);
            numbersIndex.forEach((i) => {
                const max = data.reduce((prev, current) => {
                    return (prev[i] > current[i]) ? prev : current
                })[i];
                data.forEach((array, index) => {
                    if (index > 0) {
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
        result.push({
            title: title,
            chart: GoogleCharts.api.visualization.arrayToDataTable(data),
        });
    }

    findIndexOfNumbers(array) {
        const idxs = [];
        for (let i = array.length - 1; i >= 0; i--) {
            if (typeof array[i] === "number" && i > 0) {
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
