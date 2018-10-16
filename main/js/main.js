const Jogo = function () {
    let roomId;
    var socket = io();
    let type;

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
    })
    socket.on('renderBoard', board => {
        renderBoard(board);

    })
    socket.on('turn', turn => {
        let message;
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
        resetBoard();
    })
    $('#create').click(function () {
        socket.emit('create room', { name: $('#roomName').val() });

    })
    
    $('body').on('click','.peca', function(){
        //peca_selecionada = $("#"+casa_selecionada).children("img:first").attr("id");
        peca_selecionada_local = this.id;
        tipo_peca_selecionada = peca_selecionada_local.substr(0,6);
        console.log(type);
        console.log(tipo_peca_selecionada);
        if((type == 1 && tipo_peca_selecionada == 'peca_b')
            || (type == 2 && tipo_peca_selecionada == 'peca_p')){
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
        if(peca_selecionada != null){
            var peca_selecionada_src = $("#"+peca_selecionada).attr("src");
            var peca_selecionada_id = $("#"+peca_selecionada).attr("id");
            var peca_selecionada_class = $("#"+peca_selecionada).attr("class");
            $("#"+casa_selecionada).html("");
            $("#"+casa_selecionada).removeClass("casa_selecionada").addClass("empty");


            $(this).html("<img src='"+peca_selecionada_src+"' class='"+peca_selecionada_class+"' id='"+peca_selecionada_id.split("_")[0]+"_"+peca_selecionada_id.split("_")[1]+"_"+this.id.split("_")[1]+"_"+this.id.split("_")[2]+"'/>");
            $(this).removeClass("empty");

            var movement_message = { original_address: peca_selecionada.substr(-3), destination_addresses: [this.id.substr(-3)]}
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
    

    function renderBoard(board) {
        // for (let i = 0; i < board.length; i++) {
        //     for (let j = 0; j < board[i].length; j++) {
        //         if (board[i][j] == 0) {

        //         } else {
        //             board[i][j] == 1 ? board[i][j] = 'O' : board[i][j] = 'X'
        //             $('td[data-row=' + i + '][data-col=' + j + ']').append('<div class="check">' + board[i][j] + '</div>')
        //         }
        //     }
        // }
    }
    function loadInitialBoard(){
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
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 3; j++) {


                $('td[data-row=' + i + '][data-col=' + j + ']').html('')

            }
        }
    }
}
