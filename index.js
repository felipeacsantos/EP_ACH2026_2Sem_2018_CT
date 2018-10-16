const express = require('express')
const app = express();
app.use(express.static('main'));

const server = require('http').Server(app);
const port = process.env.PORT || 3000;

const io = require('socket.io')(server);

const shortid = require('shortid');
const Jogo = require('./Jogo')

let rooms = []
io.on('connection', function (socket) {
  let roomId;
  let game;
  refreshRoomsList(io);
  socket.on('create room', room => {
    
    roomId = shortid.generate();
    rooms.push({ id: roomId, name: room.name, players: 1 })
    refreshRoomsList(io);
    socket.join(roomId, function () {
      socket.emit('room id', roomId)
    })
  })
  socket.on('join room', room => {
    socket.join(room.id)
    roomId = room.id;
    let index = findRoom(roomId)

    if (index > -1 && rooms[index].players == 1) {
      rooms[index].players++;
      refreshRoomsList(io);

      io.sockets.in(roomId).emit('player join')
      rooms[index].game = new Jogo(io,roomId)

    } else {
    }
  })

  socket.on('msg',msg =>{
    //console.log(msg);
    socket.broadcast.emit('msg',msg );
  })

  socket.on('check', (data) => {
    let index = findRoom(roomId)
    rooms[index].game.check(data.type,data.row,data.col);
  })
  socket.on('disconnect', function () {

    let index = findRoom(roomId)
    if (index > -1 && rooms[index].players == 2) {
      rooms[index].players--;
      io.sockets.in(roomId).emit('player left')

    } else {
      rooms = rooms.filter(room => {
        return room.id !== roomId
      })
    }

    refreshRoomsList(io);
  });
});

function refreshRoomsList(io) {
  io.sockets.emit('rooms', rooms)
}
function findRoom(roomId){
  return rooms.findIndex(room => {
    return room.id == roomId;
  })

}


server.listen(port);
