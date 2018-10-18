const Jogo = function () {
    let roomId;
    var socket = io();
    let type;
    let turn;

    var casa_selecionada = null;
    var peca_selecionada = null;

    loadInitialBoard();
    $('#tabuleiro').hide();
    $('.back').hide();
    $('.message').hide();

    socket.on('rooms', rooms => {
        $('.room-list').html('')
        rooms.forEach(room => {
            $('.room-list').append('<li class="room waves-effect" data-room-id="' + room.id + '">' + room.name + '</li>')
        })

        //socket.emit('my other event', { my: 'data' });
    });
    socket.on('room id', data => {
        roomId = data;
        $('#roomId').text(roomId)
        $('.buttons-screen').remove();
        $('.back').show();
        $('.message').show();
        $('.message').html('Esperando outro jogador conectar')
    })

    socket.on('player join', () => {
        $('.buttons-screen').remove();
        $('.message').show();
        $('.back').show();
        $('#tabuleiro').show();
        $('.message').html('Oponente entrou')
    })
    socket.on('player left', () => {
        $('.message').html('Oponente saiu\nEsperando outro jogador conectar')
        resetBoard();
        $('.board').hide();
    })

    socket.on('game start', () => {
        //$('.message').html('Waiting opponent connect')
    })
    socket.on('my type', myType => {
        type = myType;
        console.log('type:'+type);
        if(type == 2){
            $('#tabuleiro').addClass("rotate_board");
            $('.peca').addClass("rotate_piece");        
        }else if(type == 1){
            $('#tabuleiro').removeClass("rotate_board");
            $('.peca').removeClass("rotate_piece");
        }
    })
    socket.on('renderBoard', board => {
        renderBoard(board);

    })
    socket.on('turn', turn => {
        let message;
        Jogo.turn = turn;
        console.log(turn +" "+type);
        if (turn == type) {
            message = 'Sua vez'
        } else {
            message = 'Vez do oponente'
        }
        $('.message').html(message)
    })
    socket.on('gameIsOver', win => {
       
        if (win.type == 0) {
            $('.message').html('Empate\nReiniciando jogo em 3 segundos')
        } else {
            if (win.type == type) {
                $('.message').html('Você venceu\nReiniciando jogo em 3 segundos')
            } else {
                $('.message').html('Você perdeu\nReiniciando jogo em 3 segundos')
            }
        }
        setTimeout(function() {
            resetBoard();
        }, 3000);
    })
    $('#create').click(function () {
        socket.emit('create room', { name: $('#roomName').val() });

    })
    
    $('body').on('click','.peca', function(){
        //peca_selecionada = $("#"+casa_selecionada).children("img:first").attr("id");
        peca_selecionada_local = this.id;
        tipo_peca_selecionada = peca_selecionada_local.substr(0,6);
        console.log(type);
        console.log(Jogo.turn);
        console.log(tipo_peca_selecionada);
        if((Jogo.turn == type) && (
                    (type == 1 && tipo_peca_selecionada == 'peca_b')
                    || (type == 2 && tipo_peca_selecionada == 'peca_p')
                )
            ){
            if(casa_selecionada != null){
                $("#"+casa_selecionada).removeClass("casa_selecionada");
            }
            casa_selecionada = $(this.parentNode).attr("id");
            $("#"+casa_selecionada).addClass("casa_selecionada");
            $("#info_casa_selecionada").text(casa_selecionada);
         
            peca_selecionada = peca_selecionada_local
            if(peca_selecionada==null){
                peca_selecionada = "NENHUMA PECA SELECIONADA";
            }
            $("#info_peca_selecionada").text(peca_selecionada.toString());
        }
    })

    $('body').on('click','.casa.empty', function(){
        if(validPlay(casa_selecionada,this.id)){
            var peca_selecionada_src = $("#"+peca_selecionada).attr("src");
            var peca_selecionada_id = $("#"+peca_selecionada).attr("id");
            var peca_selecionada_class = $("#"+peca_selecionada).attr("class");
            $("#"+casa_selecionada).html("");
            $("#"+casa_selecionada).removeClass("casa_selecionada").addClass("empty");


            $(this).html("<img src='"+peca_selecionada_src+"' class='"+peca_selecionada_class+"' id='"+peca_selecionada_id.split("_")[0]+"_"+peca_selecionada_id.split("_")[1]+"_"+this.id.split("_")[1]+"_"+this.id.split("_")[2]+"'/>");
            $(this).removeClass("empty");

            var isSpecial = false;
            if(peca_selecionada_class.indexOf('dama') >= 0) isSpecial = true;

            var movement_message = { type: type, original_address: peca_selecionada.substr(-3), destination_address: this.id.substr(-3), isSpecial: isSpecial}
            socket.emit('movement', movement_message);
            
            peca_selecionada = null;
        }
    })

    $('body').on('click', '.room', function () {

        socket.emit('join room', { id: $(this).attr('data-room-id') })

    })
    //$('td').click(function () {
    //    //$(this).append('<div class="check">X</div>')

    //    socket.emit('check', { type: type, row: $(this).attr('data-row'), col: $(this).attr('data-col') })
    //})
    

    function validPlay(original_address,destination_address){
        var original_address = [parseInt(original_address.split("_")[1]),parseInt(original_address.split("_")[2])];
        var destination_address = [parseInt(destination_address.split("_")[1]),parseInt(destination_address.split("_")[2])];

        var distance = [Math.abs(original_address[0]-destination_address[0]),Math.abs(original_address[1]-destination_address[1])];

        var skipped_spot = [(original_address[0]+destination_address[0])/2,(original_address[1]+destination_address[1])/2] 

        

        if(peca_selecionada != null && (distance.equals([1,1]))){
            return true
        }else if((distance.equals([2,2]) && !($('#casa_'+skipped_spot[0]+'_'+skipped_spot[1])[0].classList.contains('empty')))){
            var skipped_piece = $('#casa_'+skipped_spot[0]+'_'+skipped_spot[1]).children("img:first").attr("id").substr(0,6);
            if((skipped_piece == 'peca_p' && type == 1)||(skipped_piece == 'peca_b' && type == 2)){
                return true
            }
        }
        return false;
    }

    function renderBoard(board) {
        console.log(board);
        $("#tabuleiro").html('');
        var i;
        for (i=0; i<8; i++){
            $("#tabuleiro").append("<div id='linha_"+i.toString()+"' class='linha' >");       
     
            for (j=0; j<8; j++){
                var nome_casa ="casa_"+i.toString()+"_"+j.toString();
                var classe = (i%2==0?(j%2==0?"casa_branca":"casa_preta"):(j%2!=0?"casa_branca":"casa_preta"));
                $("#linha_"+i.toString()).append("<div id='"+nome_casa+"' class='casa "+classe+"' />");
     
                if(board[i][j] == 2){
                    $("#"+nome_casa).append("<img src='peca_preta.png' class='peca peca_preta' id='"+nome_casa.replace("casa", "peca_preta")+"'/>");
                }else if(board[i][j] == 1){
                    $("#"+nome_casa).append("<img src='peca_branca.svg' class='peca peca_branca' id='"+nome_casa.replace("casa", "peca_branca")+"'/>");   
                }else if(board[i][j] == 20){
                    $("#"+nome_casa).append("<img src='dama_preta.png' class='peca peca_preta dama' id='"+nome_casa.replace("casa", "peca_preta")+"'/>");   
                }else if(board[i][j] == 10){
                    $("#"+nome_casa).append("<img src='dama_branca.png' class='peca peca_branca dama' id='"+nome_casa.replace("casa", "peca_branca")+"'/>");   
                }else{
                    $("#"+nome_casa).addClass("empty");
                }
            }
        }

        if(type == 2){
            $('.peca').addClass("rotate_piece");        
        }else if(type == 1){
            $('.peca').removeClass("rotate_piece");
        }
    }
    function loadInitialBoard(){
        $("#tabuleiro").html('');
        var i;
        for (i=0; i<8; i++){
            $("#tabuleiro").append("<div id='linha_"+i.toString()+"' class='linha' >");       
     
            for (j=0; j<8; j++){
                var nome_casa ="casa_"+i.toString()+"_"+j.toString();
                var classe = (i%2==0?(j%2==0?"casa_branca":"casa_preta"):(j%2!=0?"casa_branca":"casa_preta"));
                $("#linha_"+i.toString()).append("<div id='"+nome_casa+"' class='casa "+classe+"' />");
     
                if(classe == "casa_preta"){
                    if(i < 3){
                        $("#"+nome_casa).append("<img src='peca_preta.png' class='peca peca_preta' id='"+nome_casa.replace("casa", "peca_preta")+"'/>");
                    }
                    else
                    if(i > 4){
                        $("#"+nome_casa).append("<img src='peca_branca.svg' class='peca peca_branca' id='"+nome_casa.replace("casa", "peca_branca")+"'/>");   
                    }

                    if(i == 3 || i == 4){
                        $("#"+nome_casa).addClass("empty");   
                    }
     
                }
                else if(classe == "casa_branca"){
                    $("#"+nome_casa).addClass("empty");
                }
            }
        }
    }
    function resetBoard() {
        $("#tabuleiro").html('');
        loadInitialBoard();   
    }


    // Warn if overriding existing method
    if(Array.prototype.equals)
        console.warn("Overriding existing Array.prototype.equals. Possible causes: New API defines the method, there's a framework conflict or you've got double inclusions in your code.");
    // attach the .equals method to Array's prototype to call it on any array
    Array.prototype.equals = function (array) {
        // if the other array is a falsy value, return
        if (!array)
            return false;

        // compare lengths - can save a lot of time 
        if (this.length != array.length)
            return false;

        for (var i = 0, l=this.length; i < l; i++) {
            // Check if we have nested arrays
            if (this[i] instanceof Array && array[i] instanceof Array) {
                // recurse into the nested arrays
                if (!this[i].equals(array[i]))
                    return false;       
            }           
            else if (this[i] != array[i]) { 
                // Warning - two different object instances will never be equal: {x:20} != {x:20}
                return false;   
            }           
        }       
        return true;
    }
    // Hide method from for-in loops
    Object.defineProperty(Array.prototype, "equals", {enumerable: false});
}
