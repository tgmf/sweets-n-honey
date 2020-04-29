var board,
    game,
    count = 0,
    firstMove = "w";

window.onload = function () {
    initGame();
};

var socket = io();

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
        onDrop: onDrop,
        sparePieces: true,
    };

    board = new ChessBoard("board", cfg);
    game = new Chess();
    setFlag(firstMove);

    $("#defaultBtn").show();
    $("#clearBtn").show();
    $("#startBtn").show();
    $(".toggle-first-move").show();
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
    game = new Chess(board.fen() + " " + firstMove + " KQkq - 0 1");
    console.log(board.fen());
    console.log(game.fen());
    setFlag(firstMove);

    console.log("startEnd: ", game, board);
    $("#defaultBtn").hide();
    $("#clearBtn").hide();
    $("#startBtn").hide();
    $(".toggle-first-move").hide();
    $("#restartBtn").show();
    console.log(game.insufficient_material());
};

function onDrop(source, target, piece, newPos, oldPos, orientation) {
    console.log("Source: " + source);
    console.log("Target: " + target);
    console.log("Piece: " + piece);
    console.log("New position: " + Chessboard.objToFen(newPos));
    console.log("Old position: " + Chessboard.objToFen(oldPos));
    console.log("Orientation: " + orientation);
    console.log("~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~");
    socket.emit("placement", Chessboard.objToFen(newPos));
}

// called when a player makes a move on the board UI
var handleMove = function (source, target) {
    var move = game.move({ from: source, to: target });
    console.log(move);
    if (move === null) return "snapback";
    else {
        socket.emit("move", move);
        setFlag(move.color == "w" ? "b" : "w");
    }
};

var setFlag = function (color) {
    if (color == "w") $("#moveFlag").css("background-color", "white");
    else $("#moveFlag").css("background-color", "black");
};

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
$("#flipBtn").on("click", function () {
    board.flip();
});
$(".toggle-first-move button").on("click", function () {
    $(".toggle-first-move button").removeClass("active");
    $(this).addClass("active");
    firstMove = $(this).data("color");
    setFlag(firstMove);
    socket.emit("toggleFirstMove", firstMove);
});

socket.on("placement", function (position) {
    board.position(position);
});

socket.on("move", function (msg) {
    game.move(msg);
    board.position(game.fen()); // fen is the board layout
    setFlag(msg.color == "w" ? "b" : "w");
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

socket.on("toggleFirstMove", function (msg) {
    firstMove = msg;
    setFlag(firstMove);
});
