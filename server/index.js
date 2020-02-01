const Const = require('../Const');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('./')(server, {origins: '*:*'});
const port = process.env.PORT || Const.port;

const MySql = require('./class/MySql');
const Backtest = require('./class/Backtest');

const mySql = new MySql();
const backtest = new Backtest(mySql);

const resetTable = false;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

mySql.createMissingTables(() => {
    if (resetTable === true) {
        mySql.truncateCleanEvent(() => {
            initServer();
        });
    } else {
        initServer();
    }
});

function initServer() {
    io.on('connection', (socket) => {

        socket.on('event', (data, fn) => {
            switch (data.name) {
                case 'all_events':
                    mySql.getAllEvents((allEvents) => {
                        socket.emit('event', {name: 'all_events', value: allEvents});
                    });
                    break;
                case 'get_event':
                    mySql.getEvent(data.value.id, (event) => {
                        socket.emit('event', {name: 'get_event', value: event.json});
                    });
                    break;
                case 'get_clean_event':
                    backtest.getCleanEvent(data.value.id, (event) => {
                        socket.emit('event', {name: 'get_clean_event', value: event.json});
                    });
                    break;
                case 'backtest_all':
                    backtest.backTestAll(() => {
                        socket.emit('event', {name: 'backtest_all', value: null});
                    });
                    break;
                case 'truncate_all':
                    mySql.truncateCleanEvent(() => {
                        console.log("truncate all clean events");
                    });
                    break;
                default:
                    console.log("no action define", data);
            }
        });
    });
}