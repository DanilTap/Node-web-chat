const express = require('express');
const createServer = require("http");
const Server = require("socket.io");

const app = express();
const httpServer = createServer.createServer(app);
const io = new Server.Server(httpServer, {});


// Variables
var chatStats = new Object();
var chatStats = {
    users_online: 0
};


app.get('/', function(req, res) {
    //res.sendFile('./index.html', { root: __dirname });
    //res.sendFile('./front.js', { root: __dirname });
    app.use(express.static(__dirname + "/site"));
});


io.on("connection", (socket) => {
    // New user
    console.log(`Connected ${socket.id}!`);
    chatStats.users_online += 1;
    io.emit("new_user", {id: socket.id, users: chatStats.users_online});

    // Exit user
    socket.on("disconnect", (data) => {
        console.log(socket.id, "disconnected");
        chatStats.users_online -= 1;
        io.emit("udisconnect", {id: socket.id, users: chatStats.users_online})
    });

    // New message
    socket.on("new_message", (data) => {
        console.log(`${data.username}: ${data.message}`)
        io.emit("new_message", {username: data.username, message: data.message});
    });
});


httpServer.listen(3000, () => console.log('Server ready!'));