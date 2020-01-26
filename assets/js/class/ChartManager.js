"use strict";
const clone = require('clone');
const randomstring = require("randomstring");

const Function = require("../../../function/Function");

class ChartManager {
    constructor(socket, app) {
        this.app = app;
        this.socket = socket;
        this.pointLabel = {'type': 'string', 'role': 'style'};
        this.pointValueUp = "point { size: 12; shape-type: star; fill-color: red; }";
        this.pointValueDown = "point { size: 12; shape-type: star; fill-color: blue; }";
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

        //todo
        match.json.forEach((runner) => {
            const bets = runner.bets;
        });
        //region create charts
        // match.markets.runners.forEach((runner) => {
        //     const fieldsBack = ['time', runner.name, this.pointLabel, "availableAmount1", "availableAmount2", "availableAmount3", "availableAmount4"];
        //     const fieldsBack2 = ['time', runner.name, this.pointLabel];
        //
        //     const dataFormatedArray = Function.formatData(fieldsBack, runner, true, [3, 4, 5, 6], 400);
        //     const dataFormatedArray2 = Function.formatData(fieldsBack2, runner);
        //
        //     const bets = Function.findTopAndBottom(dataFormatedArray);
        //
        //     this.displayBetsOnChart(dataFormatedArray, bets);
        //
        //     this.addChartToDisplayChart(result, runner.name, dataFormatedArray2);
        //     this.addChartToDisplayChart(result, runner.name, dataFormatedArray);
        // });
        //endregion

        return result;
    }

    displayBetsOnChart(dataFormatedArray, bets) {
        bets.forEach((bet) => {
            const array = dataFormatedArray.find(x => x[0] === bet.time);
            if (bet.side === "back") {
                array[2] = this.pointValueDown;
            } else {
                array[2] = this.pointValueUp;
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

    getOptions() {
        return clone(this.options);
    }
}

module.exports = ChartManager;
