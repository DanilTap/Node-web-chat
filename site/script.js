const socket = io.connect("https://object-node.herokuapp.com");

socket.on("connect", () => {
    console.log("Connected!");
});


// Server ping
setInterval(function() {
    socket.emit("server_ping");
}, 15000);


// Variables
var chatSettings = new Object();
var chatSettings = {
    admin_password: "",
    commands_show: false,
    stick_show: false,
    settings_show: false,
    nread_stats: false,
    nread_messages: 0
};


// METHODS
window.onfocus = function () {
    chatSettings.nread_stats = true;
    chatSettings.nread_messages = 0;
    document.title = `Test Chat`;
};

window.onblur = function () {
    chatSettings.nread_stats = false;
};

function createMessage(username, message, nick_color){
    if (nick_color == "color" || nick_color == ""){
        var div = document.getElementById("messages");
        var p = document.createElement('p');
        p.innerHTML = `<strong>${username}:</strong> ${message}<br>`;
        p.className = "in_message";
        div.appendChild(p);
        div.scrollBy(0, 100);

        if (chatSettings.nread_stats == false){
            chatSettings.nread_messages += 1;
            document.title = `• ${chatSettings.nread_messages} Новых сообщений - Test Chat`
        };

    } else {
        var div = document.getElementById("messages");
        var p = document.createElement('p');
        p.innerHTML = `<strong style="color: ${nick_color};">${username}:</strong> ${message}<br>`;
        p.className = "in_message";
        div.appendChild(p);
        div.scrollBy(0, 100);

        if (chatSettings.nread_stats == false){
            chatSettings.nread_messages += 1;
            document.title = `• ${chatSettings.nread_messages} Новых сообщений - Test Chat`
        };
    }
};


// Bind
document.addEventListener('keyup', function(event){
    if (event.key == "Enter"){
        MessageSend();
    } else {
        return;
    }
});


// Send message
function MessageSend(){
    var text = document.getElementById('message');
    var message = text.value;
    text.value = "";

    var nick_color = document.getElementById('nc');
    var nc = nick_color.value;

    var nnc = nc;
    if (nc == "#FFFFFF" || nc == "#fff" || nc == "#FFF"){
        nnc = "#000";
    };

    var name = document.getElementById('username');
    var username = name.value;
    if (username == ""){
        username = "%USERNAME%";
    };

    // Slash commands
    function slashCommands(content, author){
        var cups = content.includes("/cups");
        // Clear
        if (content == "/clear"){
            var password = prompt('А ты Админ??', "Пароль");
            if (password == chatSettings.admin_password){
                socket.emit('clear_chat', {author: author});
            };

        // Cups
        } else if (cups == true){
            var incontent = content.split('/cups ')[1];
            var string = "";
            try{
                for (var i = 0; i <= content.length; i += 2){
                    var ti = i + 1;
                    string += incontent[i].toLowerCase();
                    string += incontent[ti].toUpperCase();
                };
            }
            catch{
                socket.emit('new_message', {username: author, message: string, nc: nnc});
            };

        // Ping
        } else if (content == "/ping"){
            var image = document.getElementById('ping_tester');
            var stime = new Date().getTime();

            image.setAttribute('src', 'https://www.google.com/');
            image.onerror = () => {
                var etime = new Date().getTime();
                var ping = `${author}, ${etime - stime}ms`;
                socket.emit("new_message", {username: author, message: content, nc: nnc});
                socket.emit("new_message", {username: "Server", message: ping, nc: '#000'});
            };

        // Send message
        } else { 
            socket.emit('new_message', {username: author, message: content, nc: nnc});
        };
    };
    slashCommands(message, username);
}

socket.on("new_message", (data) => {
    createMessage(data.username, data.message, data.nc);
});

socket.on("clear_back", (data) =>{
    function clearChat(){
        var div = document.getElementById('messages');
        var messages = div.querySelectorAll('.in_message');

        for(var i = 0; i <= messages.length; i++){
            try{
                div.querySelector('.in_message').remove();
            }
            catch{
                createMessage('Server', 'Чат был успешно очищен!');
            };
        };
    };
    createMessage("Server", `<i>${data.author}</i> Запустил очистку чата, она произойдет через 5 секунд`)
    setTimeout(() => clearChat(), 5000);
});


// New user
socket.on("new_user", (data) => {
    chatSettings.admin_password = data.admin_password;

    var name = document.getElementById('username');
    var username = name.value;

    var users = document.getElementById('users_online');
    users.innerHTML = `🟢 Online: ${data.users}`

    if (username != ""){
        createMessage("Server", `Подключается новый пользователь <i>${username}</i> | ID: ${data.id}`);
    } else{
        createMessage("Server", `Подключается новый пользователь <i>%USERNAME%</i> | ID: ${data.id}`);
    };
    var div = document.getElementById("messages");
    div.scrollBy(0, 100);
});

// Load messages
socket.on("new_user_socket", (data) => {
    var div = document.getElementById("messages");
    var p = document.createElement('p');
    p.innerHTML = data.messages;
    p.className = "in_message";
    div.appendChild(p);
    div.scrollBy(0, 1000);
});


// Exit user
socket.on("udisconnect", (data) => {
    var users = document.getElementById('users_online');
    users.innerHTML = `🟢 Online: ${data.users}`
    createMessage("Server", `<i>${data.id}</i> Вышел из чата`);
    var div = document.getElementById("messages");
    div.scrollBy(0, 100);
});


function stickerSend(stick){
    var nick_color = document.getElementById('nc');
    var nc = nick_color.value;

    var nnc = nc;
    if (nc == "#FFFFFF" || nc == "#fff" || nc == "#FFF"){
        nnc = "#000";
    };

    var uname = document.getElementById('username');
    var username = uname.value;
    if (username == ""){
        username = "%USERNAME%";
    };

    socket.emit("sticker_send", {author: username, name: stick, nc: nnc});
}

// Sticks
socket.on("sticker_back", (data) => {
    createMessage(data.name, data.text, data.nc);
});



// Front
function commandsClick(){
    if (chatSettings.commands_show == false){
        document.getElementById('commands_list').hidden = false;
        chatSettings.commands_show = true;
    } else if (chatSettings.commands_show == true){
        document.getElementById('commands_list').hidden = true;
        chatSettings.commands_show = false;
    }
};

function stickClick(){
    if (chatSettings.stick_show == false){
        document.getElementById('stickers').hidden = false;
        chatSettings.stick_show = true;
    } else if (chatSettings.stick_show == true){
        document.getElementById('stickers').hidden = true;
        chatSettings.stick_show = false;
    }
}

function settingsClick(){
    console.log("ggg");
    console.log(chatSettings.settings_show);
    var settings_block = document.getElementById('settings');
    if (chatSettings.settings_show == false){
        settings_block.setAttribute("style", "z-index: 1000 !important; opacity: 1 !important;");
        chatSettings.settings_show = true;

    } else if (chatSettings.settings_show == true){
        settings_block.setAttribute("style", "z-index: 0 !important; opacity: 0 !important;");
        chatSettings.settings_show = false;
    }
}
