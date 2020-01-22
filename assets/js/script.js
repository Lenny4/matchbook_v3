"use strict";
require('../css/style.scss');
require('popper.js');
const $ = require('jquery');
global.$ = global.jQuery = $;
require('bootstrap');
const io = require('socket.io-client');
const Const = require('../../Const');

import {GoogleCharts} from 'google-charts';

global.GoogleCharts = GoogleCharts;

const App = require('./class/App');
const ChartManager = require('./class/ChartManager');

const socket = io('http://127.0.0.1:' + Const.port + '/');

const app = new App(socket);
const chartManager = new ChartManager(socket, app);

GoogleCharts.load(initView);

function initView() {
    app.init(chartManager);
}

