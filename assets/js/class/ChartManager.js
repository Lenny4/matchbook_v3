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
            // chartArea: {left: 50, top: 1, width: "95%", height: "90%"},
            series: {
                0: {color: '#43459d'},
                1: {color: '#e2431e'},
                2: {color: '#e2431e'},
                3: {color: '#e2431e'},
                4: {color: '#e2431e'},
                5: {color: '#6f9654'},
            }
        };
    }

    createChart(match) {
        const fields = [['time', 'cheval1', this.pointLabel, 'cheval2', this.pointLabel]];
        //todo use match datas
        const data = [
            [-100, 60, null, 50, null],
            [-50, 50, this.pointValue, 40, this.pointValue],
            [-0, 40, null, 70, null]
        ];
        return GoogleCharts.api.visualization.arrayToDataTable(fields.concat(data));
    }

    displayChart(eventId) {
        const match = this.app.matchs.find(x => parseInt(x.eventId) === parseInt(eventId));
        this.drawChart(match);
    }

    drawChart(match) {
        //get chart data
        const data = this.createChart(match);

        //create div to display chart
        const chartDivId = randomstring.generate();
        $("#match_" + match.eventId).append("<div id='" + chartDivId + "'></div>");
        const pie_1_chart = new GoogleCharts.api.visualization.LineChart(document.getElementById(chartDivId));

        //get the options
        const options = this.getOptions();
        options.title = "mon titre";

        //draw chart
        pie_1_chart.draw(data, options);
    }

    getOptions() {
        return clone(this.options);
    }
}

module.exports = ChartManager;