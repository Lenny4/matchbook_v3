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
            //todo test with get_event
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
                    const match = JSON.parse(data.value);
                    this.matchs.push(match);
                    this.chartManager.displayChart(match.eventId);
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
    }

    initTabs() {
        this.smallMatchs.forEach((match, index) => {
            $(".smallMatchs").append(`
            <div class="col-4">
                <a class="card" target="_blank" style="margin-bottom: 10px" href="/?id=` + match.eventId + `">
                    ` + match.name + `
                </a>
            </div>
            `);
        });
    }
}

module.exports = App;