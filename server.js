const express = require("express");
const createServer = require("http");
const Server = require("socket.io");
const fs = require("fs");

/*
function RestDB(){
    fs.readFile('db.txt', 'utf8', (err, data) => {
        if (err) throw err;
        var messages = data;
        console.log(`Read done: ${messages}`);

        fs.writeFile(
            'db.txt',
            `${messages} NEW`,
            'utf8',
            (err) => {
            if (err) throw err;

            console.log('Writing done!');
            }
        );
    });
};

RestDB();
*/


const app = express();
const httpServer = createServer.createServer(app);
const io = new Server.Server(httpServer, {});


// Variables
var chatStats = new Object();
var chatStats = {
    users_online: 0,
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

    // Write db
    fs.readFile('db.txt', 'utf8', (err, mdata) => {
        if (err) throw err;

        var nmessage = `${mdata}<br>\n<strong>Server:</strong> Подключается новый пользователь <i>%USERNAME%</i> | ID: ${socket.id}<br>`;
        fs.writeFile(
            'db.txt',
            nmessage,
            'utf8',
            (err) => {
            if (err) throw err;
            }
        );
        socket.emit("new_user_socket", {messages: mdata});
        io.emit("new_user", {id: socket.id, users: chatStats.users_online});
    });



    // Exit user
    socket.on("disconnect", (data) => {
        console.log(socket.id, "disconnected");
        chatStats.users_online -= 1;
        io.emit("udisconnect", {id: socket.id, users: chatStats.users_online})

        // Write db
        fs.readFile('db.txt', 'utf8', (err, mdata) => {
            if (err) throw err;

            var nmessage = `${mdata}<br>\n<strong>Server:</strong> <i>${socket.id}</i> Вышел из чата<br>`;
            fs.writeFile(
                'db.txt',
                nmessage,
                'utf8',
                (err) => {
                if (err) throw err;
                }
            );
        });

    });



    // New message
    socket.on("new_message", (data) => {
        console.log(`${data.username}: ${data.message}`)
        io.emit("new_message", {username: data.username, message: data.message});

        // Write db
        fs.readFile('db.txt', 'utf8', (err, mdata) => {
            if (err) throw err;

            var nmessage = `${mdata}<br>\n<strong>${data.username}</strong>: ${data.message}<br>\n`;
            fs.writeFile(
                'db.txt',
                nmessage,
                'utf8',
                (err) => {
                if (err) throw err;
                }
            );
        });
    });

});


var port = process.env.PORT || 8080;

httpServer.listen(port, () => console.log('Server ready!'));
