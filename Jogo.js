module.exports = function (io, roomId) {
    this.players = []
    this.board;
    this.turn;
    this.drawCount;

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
        this.drawCount = 0;
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

    this.movement = function (type, original_address, destination_address, isSpecial){
        this.drawCount++;

        let o_address = [parseInt(original_address.split("_")[0]),parseInt(original_address.split("_")[1])];
        let d_address = [parseInt(destination_address.split("_")[0]),parseInt(destination_address.split("_")[1])];

        var specialMarker = 1
        if((d_address[0] == 0 && type == 1) || (d_address[0] == 7 && type == 2) || isSpecial){
            specialMarker = 10;
        }

        this.board[o_address[0]][o_address[1]] = 0;
        this.board[d_address[0]][d_address[1]] = type*specialMarker;

        var distance = [Math.abs(o_address[0]-d_address[0]),Math.abs(o_address[1]-d_address[1])];
        if(distance[0] > 1 && distance[1] > 1){
            var skipped_spot = [(o_address[0]+d_address[0])/2,(o_address[1]+d_address[1])/2]
            this.board[skipped_spot[0]][skipped_spot[1]] = 0;
            this.drawCount = 0;
        }


        this.renderBoard();
        console.error(o_address);
        console.error(d_address);
        console.error(distance);
        console.error(this.board);

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
        //verify 1 win
        if (this.isInMatrix(2) == false && this.isInMatrix(20) == false) {
            console.error("player 1 wins");
            ret = 1
            io.sockets.in(roomId).emit('gameIsOver', { type: 1 });
        //verify 2 win
        } else if (this.isInMatrix(1) == false && this.isInMatrix(10) == false) {
            console.error("player 2 wins");
            ret = 1
            io.sockets.in(roomId).emit('gameIsOver', { type: 2 });
        } else if(this.drawCount >= 20) {
            console.error("it's a draw");
            ret = 1
            io.sockets.in(roomId).emit('gameIsOver', { type: 0 });
        }
        return ret;
    }

    this.isInMatrix = function(item){
        for (var i = 0; i < this.board.length; i++) {
            // This if statement depends on the format of your array
            for(var j = 0; j < this.board[i].length; j++){
                if (this.board[i][j] == item)return true;   // Found it
            }
        }
        return false;   // Not found
    }

    this.init();
}
