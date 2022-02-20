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
    // Server ping
    socket.on("server_ping", (data) => {return;})



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
        io.emit("new_user", {id: socket.id, users: chatStats.users_online, admin_password: "admin69"});
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
        io.emit("new_message", {username: data.username, message: data.message, nc: data.nc});

        // Write db
        fs.readFile('db.txt', 'utf8', (err, mdata) => {
            if (err) throw err;

            var nmessage = `${mdata}<br>\n<strong style="color: ${data.nc};">${data.username}</strong>: ${data.message}<br>\n`;
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


    // Sticker message
    socket.on("sticker_send", (data) => {
        console.log(`${data.username}: ${data.name}`)
        var msg = "";

        if (data.name == "smiley"){
            msg = '<img style="width: 65px; height: 50px; position: relative; top: 18px;" src="./images/smiley.png" alt="">';
        } else if (data.name == "cup"){
            msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/cup.png" alt="">';
        } else if (data.name == "server"){
            msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/server.png" alt="">';
        } else if (data.name == "1c"){
            msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/1c.jpg" alt="">';
        } else if (data.name == "aue"){
            msg = '<img style="width: 55px; height: 50px; position: relative; top: 18px;" src="./images/aue.jpeg" alt="">';
        } else if (data.name == "hm"){
            msg = '<img style="width: 55px; height: 50px; position: relative; top: 18px;" src="./images/hm.png" alt="">';
        } else if (data.name == "shirik1"){
            msg = '<img style="width: 80px; height: 70px; position: relative; top: 18px;" src="./images/shirik1.png" alt="">';
        } else if (data.name == "JS"){
            msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/js.png" alt="">';
        } else if (data.name == "bandit"){
            msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/bandit.gif" alt="">';
        } else if (data.name == "cho"){
            msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/cho.png" alt="">';
        } else if (data.name == "cosoi"){
            msg = '<img style="width: 45px; height: 50px; position: relative; top: 18px;" src="./images/cosoi.gif" alt="">';
        } else if (data.name == "dirol"){
            msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/dirol.gif" alt="">';
        } else if (data.name == "hahaha"){
            msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/hahaha.png" alt="">';
        } else if (data.name == "hahaha1"){
            msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/hahaha1.gif" alt="">';
        } else if (data.name == "wall"){
            msg = '<img style="width: 80px; height: 45px; position: relative; top: 18px;" src="./images/wall.gif" alt="">';
        } else if (data.name == "thumbs_up"){
            msg = '<img style="width: 50px; height: 50px; position: relative; top: 18px;" src="./images/thumbs_up.gif" alt="">';
        };

        io.emit("sticker_back", {name: data.author, text: msg, nc: data.nc});

        // Write db
        fs.readFile('db.txt', 'utf8', (err, mdata) => {
            if (err) throw err;

        var string = `${mdata}<br>\n<strong style="color: ${data.nc};">${data.author}</strong>: ${msg}<br>\n`
            fs.writeFile(
                'db.txt',
                string,
                'utf8',
                (err) => {
                if (err) throw err;
                }
            );
        });
    });


    // Clear chat
    socket.on("clear_chat", (data) => {
        // Write db
        fs.readFile('db.txt', 'utf8', (err, mdata) => {
            if (err) throw err;

            fs.writeFile(
                'db.txt',
                '<strong>Server:</strong> Чат был успешно очищен!<br>\n',
                'utf8',
                (err) => {
                if (err) throw err;
                }
            );
        });
        io.emit("clear_back", {author: data.author});
    });

});


var port = process.env.PORT || 8080;

httpServer.listen(port, () => console.log('Server ready!'));
