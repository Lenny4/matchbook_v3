"use strict";
const clone = require('clone');
const randomstring = require("randomstring");
const regression = require("regression");

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
            series: {
                0: {color: '#43459d'},
                1: {color: '#e2431e'},
                2: {color: '#2de272'},
                3: {color: '#e2431e'},
                4: {color: '#e2431e'},
                5: {color: '#6f9654'},
            }
        };
    }

    createCharts(match) {
        const result = [];

        //region create charts
        match.markets.runners.forEach((runner) => {
            const fields = [['time', 'Volume', runner.name, 'Regression']];
            const data = [];

            const maxOdd =  runner.prices.reduce(function(prev, current) {
                return (prev.value[4].odds > current.value[4].odds) ? prev : current
            }).value[4].odds;

            let maxAmount = 0;
            runner.prices.forEach((price) => {
                const amount = this.getSommeVolume(price.value);
                if(amount > maxAmount){
                    maxAmount = amount;
                }
            });

            runner.prices.forEach((price) => {
                const odd = price.value[4].odds;
                const amount = this.getSommeVolume(price.value);
                data.push([price.time, (amount / maxAmount), (odd / maxOdd)]);
            });

            const volumeData = data.map(function(val){
                return val.slice(0, 2); // On ne prend que les 2 première colonne (temps / volume)
            });

            const startIndex = 100;
            for(let i = 0; i < data.length; i++){
                if(i < startIndex){
                    data[i].push(null);
                } else {
                    const regr = regression.linear(volumeData.slice(i - startIndex, i));
                    data[i].push(regr.points[0][1]);
                }
            }

            this.addChartToDisplayChart(result, "mon titre", fields.concat(data));
        });
        //endregion

        return result;
    }

    getSommeVolume(priceValues) {
        let amount = 0;
        priceValues.forEach((value) => {
            amount += value['available-amount'];
        });
        return amount;
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
