const express = require('express')
const app = express();
app.use(express.static('main'));

const server = require('http').Server(app);
const port = process.env.PORT || 3000;

const io = require('socket.io')(server);

server.listen(port);
