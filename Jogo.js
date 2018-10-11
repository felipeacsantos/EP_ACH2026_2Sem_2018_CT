module.exports = function (io, roomId) {
    this.players = []
    this.board;
    this.turn;

    this.init = function () {
        this.board = this.newBoard();
        for (let key in io.sockets.adapter.rooms[roomId].sockets) {
            this.players.push(key)
        }
        let type = Math.floor(Math.random() * 2) + 1
        io.sockets.connected[this.players[0]].type = type;
        type == 1 ? io.sockets.connected[this.players[1]].type = 2 : io.sockets.connected[this.players[1]].type = 1;
        io.sockets.connected[this.players[0]].emit('my type', io.sockets.connected[this.players[0]].type)
        io.sockets.connected[this.players[1]].emit('my type', io.sockets.connected[this.players[1]].type)
        this.turn = 1;
        // io.sockets.in(roomId).emit('game start')
        
        io.sockets.in(roomId).emit('turn', this.turn)
    }
    this.newBoard = function () {
        return [
            [0, 0, 0],
            [0, 0, 0],
            [0, 0, 0]
        ]
    }
    this.showPlayers = function () {
        console.log(this.players)
    }
    this.getTurn = function () {
        return this.turn;
    }
    this.changeTurn = function () {
        this.turn == 1 ? this.turn = 2 : this.turn = 1;
        io.sockets.in(roomId).emit('turn', this.turn)
    }

    this.check = function (type, row, col) {
        if (this.getTurn() == type && this.board[row][col] == 0) {
            this.board[row][col] = type;
            this.renderBoard();
           if(this.gameIsOver()==-1){
            this.changeTurn();
           }else{
               let _this = this;
               setTimeout(()=>{
                   this.init();
               },3000)              
           }
        }
    }
    this.renderBoard = function () {
        io.sockets.in(roomId).emit('renderBoard', this.board)
    }
    this.gameIsOver = function () {
        let ret = -1;
        //verify O win
        if (this.board[0][0] == 1 && this.board[0][1] == 1 && this.board[0][2] == 1 ||
            this.board[1][0] == 1 && this.board[1][1] == 1 && this.board[1][2] == 1 ||
            this.board[2][0] == 1 && this.board[2][1] == 1 && this.board[2][2] == 1 ||
            this.board[0][0] == 1 && this.board[1][0] == 1 && this.board[2][0] == 1 ||
            this.board[0][1] == 1 && this.board[1][1] == 1 && this.board[2][1] == 1 ||
            this.board[0][2] == 1 && this.board[1][2] == 1 && this.board[2][2] == 1 ||
            this.board[0][0] == 1 && this.board[1][1] == 1 && this.board[2][2] == 1 ||
            this.board[0][2] == 1 && this.board[1][1] == 1 && this.board[2][0] == 1) {
                ret = 1
            io.sockets.in(roomId).emit('gameIsOver', { type: 1 });
            //verify X win
        } else if (this.board[0][0] == 2 && this.board[0][1] == 2 && this.board[0][2] == 2 ||
            this.board[1][0] == 2 && this.board[1][1] == 2 && this.board[1][2] == 2 ||
            this.board[2][0] == 2 && this.board[2][1] == 2 && this.board[2][2] == 2 ||
            this.board[0][0] == 2 && this.board[1][0] == 2 && this.board[2][0] == 2 ||
            this.board[0][1] == 2 && this.board[1][1] == 2 && this.board[2][1] == 2 ||
            this.board[0][2] == 2 && this.board[1][2] == 2 && this.board[2][2] == 2 ||
            this.board[0][0] == 2 && this.board[1][1] == 2 && this.board[2][2] == 2 ||
            this.board[0][2] == 2 && this.board[1][1] == 2 && this.board[2][0] == 2) {
                ret = 1
            io.sockets.in(roomId).emit('gameIsOver', { type: 2 });
        } else if(this.board[0][0] != 0 && this.board[0][1] != 0 && this.board[0][2] != 0 &&
            this.board[1][0] != 0 && this.board[1][1] != 0 && this.board[1][2] != 0 &&
            this.board[2][0] != 0 && this.board[2][1] != 0 && this.board[2][2] != 0) {
            ret = 1
            //draw
            io.sockets.in(roomId).emit('gameIsOver', { type: 0 });
        }
        return ret;
    }
    this.init();
}
