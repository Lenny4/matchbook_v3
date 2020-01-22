"use strict";

class App {
    constructor(socket) {
        this.matchs = [];
        this.smallMatchs = [];
        this.socket = socket;
        this.chartManager = null;
    }

    init(chartManager) {
        this.chartManager = chartManager;

        this.socket.emit('event', {name: "all_events", value: null});

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
            const matchIndex = "match_" + match.eventId;
            $("#nav").append(`
            <li class="nav-item">
                <a class="nav-link" data-toggle="tab" href="#` + matchIndex + `">` + match.name + `</a>
            </li>
            `);
            $("#nav-container").append(`
                <div class="tab-pane" id="` + matchIndex + `" data-match-id="` + match.eventId + `">
                    <button type="button" class="btn btn-primary display-chart">Display chart</button>
                    <button type="button" class="btn btn-secondary display-log">Display log</button>
                </div>
            `);
        });
    }
}

module.exports = App;