"use strict";
const queryString = require('query-string');

class App {
    constructor(socket) {
        this.matchs = [];
        this.smallMatchs = [];
        this.socket = socket;
        this.chartManager = null;
    }

    init(chartManager) {
        this.chartManager = chartManager;

        const parsed = queryString.parse(location.search);
        if (typeof parsed.id === "string") {
            this.socket.emit('event', {name: "get_clean_event", value: {id: parsed.id}});
        } else {
            this.socket.emit('event', {name: "all_events", value: null});
        }

        this.socket.on('event', (data) => {
            switch (data.name) {
                case 'all_events':
                    data.value.forEach((smallMatch) => {
                        if (typeof this.smallMatchs.find(x => x.eventId === smallMatch.eventId) !== "object") {
                            this.smallMatchs.push(smallMatch);
                        }
                    });
                    this.initTabs();
                    this.registerEvent();
                    break;
                case 'get_clean_event':
                    let match = data.value;
                    if (typeof match === "string") {
                        match = JSON.parse(match);
                    }
                    this.matchs.push(match);
                    this.chartManager.displayChart(match.eventId);
                    break;
                case 'backtest_all':
                    alert("all backtest done !");
                    break;
                default:
                    console.log("no action define", console.log(data));
            }
        });
    }

    registerEvent() {
        $(document).on("click", ".display-chart, .display-log", (e) => {
            const eventId = $(e.target).closest(".tab-pane").attr("data-match-id");
            if ($(e.target).hasClass("display-chart")) {
                this.chartManager.displayChart(eventId);
            } else if ($(e.target).hasClass("display-log")) {
                console.log(this.matchs.find(x => parseInt(x.eventId) === parseInt(eventId)));
            }
        });
        $(document).on("click", "#backtest_all", (e) => {
            this.socket.emit('event', {name: "backtest_all", value: null});
        });
    }

    initTabs() {
        this.smallMatchs.forEach((match, index) => {
            if (index === 0) console.log(match);
            $(".smallMatchs").append(`
            <div class="col-4">
                <a data-weekday="` + match.weekday + `" data-raceName="` + match.raceName + `"
                class="card" target="_blank" style="margin-bottom: 10px" href="/?id=` + match.eventId + `">
                    <p>` + match.name + `</p>
                    <p>` + match.nbBets + `</p>
                    <p>` + parseInt(match.gain * 100) / 100 + `</p>
                </a>
            </div>
            `);
        });
    }
}

module.exports = App;
