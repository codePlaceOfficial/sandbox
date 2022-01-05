//https://github.com/socketio/socket.io
//与express结合
//注意跨域问题
const express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io")(server),
    path = require("path");

io.on("connection", client => {
    client.emit("hehe", "你好！");
    client.on("haha", msg => {
        console.log("haha", msg);
    });
});
app.use(express.static("./static"));

app.use("./", function (req, res) {
    res.sendFile(path.join(__dirname, "./static/index.html"))
});

let ws = server.listen(3000, function () {
    console.log('start at port:' + ws.address().port);
});

