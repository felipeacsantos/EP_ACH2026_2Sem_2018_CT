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
            [0, 2, 0, 2, 0, 2, 0, 2],
            [2, 0, 2, 0, 2, 0, 2, 0],
            [0, 2, 0, 2, 0, 2, 0, 2],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 0, 1, 0, 1, 0],
            [0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0]
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

    this.movement = function (original_address, destination_address){
        let o_address = original_address.split("_");
        let d_address = destination_address.split("_");

        console.error(o_address);
        console.error(d_address);

        if(this.gameIsOver()==-1){
            this.changeTurn();
        }else{
            let _this = this;
            setTimeout(()=>{
                this.init();
            },3000)              
        }
    }

    this.renderBoard = function () {
        io.sockets.in(roomId).emit('renderBoard', this.board)
    }
    this.gameIsOver = function () {
        let ret = -1;
        //verify O win
        if (this.board.indexOf(2) == -1) {
                ret = 1
            io.sockets.in(roomId).emit('gameIsOver', { type: 1 });
            //verify X win
        } else if (this.board.indexOf(1) == -1) {
                ret = 1
            io.sockets.in(roomId).emit('gameIsOver', { type: 2 });
        } else if(this.countPlaysWithoutRemoval >= 20) {
            ret = 1
            //draw
            io.sockets.in(roomId).emit('gameIsOver', { type: 0 });
        }
        return ret;
    }
    this.init();
}
