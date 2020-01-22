const Const = require('../Const');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('./')(server, {origins: '*:*'});
const port = process.env.PORT || Const.port;

const MySql = require('./class/MySql');

const mySql = new MySql();

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

io.on('connection', (socket) => {

    socket.on('event', (data, fn) => {
        switch (data.name) {
            case 'all_events':
                mySql.getAllEvents((allEvents) => {
                    socket.emit('event', {name: 'all_events', value: allEvents});
                });
                break;
            default:
                console.log("no action define", data);
        }
    });
});
