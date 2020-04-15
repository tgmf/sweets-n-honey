var board;
var game;

window.onload = function () {
    initGame();
};

var socket = io();

window.onclick = function (e) {
    socket.emit("message", "hello world!");
};

var initGame = function () {
    var cfg = {
        draggable: true,
        position: "start",
        onDrop: handleMove,
        sparePieces: true,
    };

    board = new ChessBoard("board", cfg);
    game = new Chess();

    $("#startBtn").on("click", board.start);
    $("#clearBtn").on("click", board.clear);
};

// called when a player makes a move on the board UI
var handleMove = function (source, target) {
    var move = game.move({ from: source, to: target });

    if (move === null) return "snapback";
    else socket.emit("move", move);
};

socket.on("move", function (msg) {
    game.move(msg);
    board.position(game.fen()); // fen is the board layout
});
