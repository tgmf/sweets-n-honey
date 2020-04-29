var express = require("express");
var app = express();
app.use(express.static("public"));
var http = require("http").Server(app);
var port = process.env.PORT || 3000;

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

http.listen(port, function () {
    console.log("listening on *: " + port);
});

// setup my socket server
var io = require("socket.io")(http);

io.on("connection", function (socket) {
    console.log("new connection");

    socket.on("move", function (msg) {
        socket.broadcast.emit("move", msg);
    });

    socket.on("default", function (msg) {
        socket.broadcast.emit("default", msg);
    });

    socket.on("clear", function (msg) {
        socket.broadcast.emit("clear", msg);
    });

    socket.on("start", function (msg) {
        socket.broadcast.emit("start", msg);
    });

    socket.on("restart", function (msg) {
        socket.broadcast.emit("restart", msg);
    });

    socket.on("placement", function (msg) {
        socket.broadcast.emit("placement", msg);
    });

    socket.on("toggleFirstMove", function (msg) {
        socket.broadcast.emit("toggleFirstMove", msg);
    });
});
