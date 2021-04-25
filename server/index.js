const express = require('express');
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
app.use(express.static('./public'));

const io = socketIO(server);
require('./io.js')(io);

process.on('uncaughtException', (e) => {
    console.log('Uncaught Exception:', e);
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`Server is up on port: ${port}`);
});