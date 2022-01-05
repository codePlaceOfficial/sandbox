const sandboxs = require("../../services/sandbox");
const express = require("express"),
    app = express(),
    server = require("http").createServer(app),
    io = require("socket.io")(server),
    path = require("path");

app.use(express.static("./static"));
app.use("./", function (req, res) {
    res.sendFile(path.join(__dirname, "./static/index.html"))
});

let ws = server.listen(3000, function () {
    console.log('start at port:' + ws.address().port);
});

io.on("connection", client => {
    // client.emit("show", "connet success \n");
    sandboxs.getSandbox().then(sandbox => {
        sandbox.getCmdStream().then(stream => {
            stream.on('data', (chunk) => {
                client.emit("show", chunk.toString());
            });
            client.on("input", data => {
                stream.write(data);
            })
        })
    });
    
});
