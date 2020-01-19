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
            const fields = [['time', runner.name, this.pointLabel]];
            const data = [];
            runner.prices.forEach((price) => {
                data.push([price.time, price.value[0].odds, null]);
            });
            this.addChartToDisplayChart(result, runner.name, fields.concat(data), true, [1], 400);
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
            console.log(numbersIndex);
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
    };

    getOptions() {
        return clone(this.options);
    }
}

module.exports = ChartManager;
