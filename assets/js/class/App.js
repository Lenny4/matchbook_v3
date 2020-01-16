"use strict";

const match_1 = require('../../../matchs/1');
// const match_2 = require('../../../matchs/2');
// const match_3 = require('../../../matchs/3');
// const match_4 = require('../../../matchs/4');
// const match_5 = require('../../../matchs/5');
// const match_6 = require('../../../matchs/6');
// const match_7 = require('../../../matchs/7');
// const match_8 = require('../../../matchs/8');

class App {
    constructor() {
        this.matchs = [];
        this.chartManager = null;
    }

    init(chartManager) {
        this.chartManager = chartManager;
        this.matchs.push(match_1);
        // this.matchs.push(match_2);
        // this.matchs.push(match_3);
        // this.matchs.push(match_4);
        // this.matchs.push(match_5);
        // this.matchs.push(match_6);
        // this.matchs.push(match_7);
        // this.matchs.push(match_8);

        this.initTabs();
        this.registerEvent();
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
        this.matchs.forEach((match, index) => {
            const matchIndex = "match_" + index;
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