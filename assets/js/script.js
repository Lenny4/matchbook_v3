"use strict";
require('../css/style.scss');
require('popper.js');
const $ = require('jquery');
global.$ = global.jQuery = $;
require('bootstrap');

import {GoogleCharts} from 'google-charts';
global.GoogleCharts = GoogleCharts;

const App = require('./class/App');
const ChartManager = require('./class/ChartManager');

const app = new App();
const chartManager = new ChartManager(app);

GoogleCharts.load(initView);

function initView() {
    app.init(chartManager);
}

