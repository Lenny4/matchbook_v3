const Const = require('../Const');
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('./')(server, { origins: '*:*'});
const port = process.env.PORT || Const.port;

server.listen(port, () => {
    console.log('Server listening at port %d', port);
});

io.on('connection', (socket) => {
    console.log(1);
});
