var board;
var game;
var count = 0;
var socket = io();

window.onload = function () {
    initGame();
};

$("#defaultBtn").on("click", function () {
    console.log("defClick");
    board.start();
    socket.emit("default");
});
$("#clearBtn").on("click", function () {
    console.log("clearClick");
    board.clear();
    socket.emit("clear");
});
$("#startBtn").on("click", function () {
    console.log("startClick");
    startGame();
    socket.emit("start");
});
$("#restartBtn").on("click", function () {
    console.log("restartClick");
    initGame(true);
    socket.emit("restart");
});

window.onclick = function (e) {
    socket.emit("message");
};

var initGame = function (restart) {
    count += 1;
    console.log("init " + count);
    if (restart == true) {
        game.clear();
        board.destroy();
    }

    var cfg = {
        draggable: true,
        position: "clear",
        dropOffBoard: "trash",
        sparePieces: true,
    };

    board = new ChessBoard("board", cfg);
    game = new Chess();

    $("#defaultBtn").show();
    $("#clearBtn").show();
    $("#startBtn").show();
    $("#restartBtn").hide();
};

var startGame = function () {
    console.log("start");
    var position = board.position();
    game.clear();
    board.destroy();
    console.log("startStart: ", game, board);
    var cfg = {
        draggable: true,
        position: position,
        onDrop: handleMove,
    };
    board = new ChessBoard("board", cfg);
    game = new Chess(board.fen() + " w KQkq - 0 1");
    console.log(board.fen());
    console.log(game.fen());

    console.log("startEnd: ", game, board);
    $("#defaultBtn").hide();
    $("#clearBtn").hide();
    $("#startBtn").hide();
    $("#restartBtn").show();
    console.log(game.insufficient_material());
};

// called when a player makes a move on the board UI
var handleMove = function (source, target) {
    var move = game.move({ from: source, to: target });
    console.log(move);
    if (move === null) return "snapback";
    else socket.emit("move", move);
};

socket.on("move", function (msg) {
    console.log("socket - move");
    game.move(msg);
    board.position(game.fen()); // fen is the board layout
});

socket.on("default", function (msg) {
    console.log("socket - default");
    board.start();
});

socket.on("clear", function (msg) {
    board.clear();
});

socket.on("start", function (msg) {
    startGame();
});

socket.on("restart", function (msg) {
    initGame(true);
});
