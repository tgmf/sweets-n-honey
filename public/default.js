var board;
var game;
var count = 0;

window.onload = function () {
    initGame();
};

var socket = io();

$("#defaultBtn").on("click", function () {
    board.start();
    socket.emit("default");
});
$("#clearBtn").on("click", function () {
    board.clear();
    socket.emit("clear");
});
$("#startBtn").on("click", function () {
    startGame();
    socket.emit("start");
});
$("#restartBtn").on("click", function () {
    initGame(true);
    socket.emit("restart");
});

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
    game.move(msg);
    board.position(game.fen()); // fen is the board layout
});

socket.on("default", function () {
    board.start();
});

socket.on("clear", function () {
    board.clear();
});

socket.on("start", function () {
    startGame();
});

socket.on("restart", function () {
    initGame(true);
});
