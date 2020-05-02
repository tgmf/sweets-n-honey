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

    window.onresize = function () {
        this.board.resize();
    };

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
    var cfg = {
        draggable: true,
        position: position,
        onDrop: handleMove,
        onSnapEnd: onSnapEnd,
    };
    board = new ChessBoard("board", cfg);
    game = new Chess(board.fen() + " " + firstMove + " KQkq - 0 1");
    console.log(game.fen());
    setFlag(firstMove);
    console.log(game, board);
    $("#defaultBtn").hide();
    $("#clearBtn").hide();
    $("#startBtn").hide();
    $(".toggle-first-move").hide();
    $("#restartBtn").show();
    if (game.game_over()) {
        alert("T-T");
    }
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
    getCount(Chessboard.objToFen(newPos));
}

var onSnapEnd = function () {
    board.position(game.fen());
};

var getCount = function (position) {
    var countW = 0,
        countB = 0,
        i = position.length;
    while (i--) {
        switch (position[i]) {
            case "p":
                countB += 1;
                break;
            case "r":
                countB += 5;
                break;
            case "n":
                countB += 3;
                break;
            case "b":
                countB += 3.5;
                break;
            case "q":
                countB += 9;
                break;
            case "P":
                countW += 1;
                break;
            case "R":
                countW += 5;
                break;
            case "N":
                countW += 3;
                break;
            case "B":
                countW += 3.5;
                break;
            case "Q":
                countW += 9;
                break;
        }
    }
    $("#currenW").text(countW);
    $("#currenB").text(countB);
};

// called when a player makes a move on the board UI
var handleMove = function (source, target) {
    var move = game.move({ from: source, to: target, promotion: "q" });
    if (move === null) return "snapback";
    else {
        socket.emit("move", move);
        renderMoveHistory(game.history());
        getCount(board.fen());
        if (game.game_over()) {
            alert("T-T");
        } else {
            setFlag(move.color == "w" ? "b" : "w");
        }
    }
};

var setFlag = function (color) {
    if (color == "w") $("#moveFlag").css("background-color", "#FFEB3B");
    else $("#moveFlag").css("background-color", "#BC9337");
};

var renderMoveHistory = function (moves) {
    var historyElement = $("#moveHistory").empty();
    historyElement.empty();
    for (var i = 0; i < moves.length; i = i + 2) {
        historyElement.append(
            "<span>" +
                moves[i] +
                " " +
                (moves[i + 1] ? moves[i + 1] : " ") +
                "</span><br>"
        );
    }
    historyElement.scrollTop(historyElement[0].scrollHeight);
};

$("#defaultBtn").on("click", function () {
    board.start();
    getCount(board.fen());
    socket.emit("default");
});
$("#clearBtn").on("click", function () {
    board.clear();
    getCount(board.fen());
    socket.emit("clear");
});
$("#startBtn").on("click", function () {
    startGame();
    socket.emit("start");
});
$("#restartBtn").on("click", function () {
    initGame(true);
    getCount(board.fen());
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
    getCount(board.fen());
});

socket.on("move", function (msg) {
    game.move(msg);
    board.position(game.fen()); // fen is the board layout
    getCount(board.fen());
    renderMoveHistory(game.history());
    if (game.game_over()) {
        alert("T-T");
    } else {
        setFlag(msg.color == "w" ? "b" : "w");
    }
});

socket.on("default", function () {
    board.start();
    getCount(board.fen());
});

socket.on("clear", function () {
    board.clear();
    getCount(board.fen());
});

socket.on("start", function () {
    startGame();
});

socket.on("restart", function () {
    initGame(true);
    getCount(board.fen());
});

socket.on("toggleFirstMove", function (msg) {
    firstMove = msg;
    setFlag(firstMove);
});
