const socket = io.connect("object-node.herokuapp.com");

socket.on("connect", () => {
    console.log("Connected!");
});


// Variables
var chatSettings = new Object();
var chatSettings = {
    admin_password: "",
    commands_show: false,
    stick_show: false
};


// METHODS
function createMessage(username, message){
    var div = document.getElementById("messages");
    var p = document.createElement('p');
    p.innerHTML = `<strong>${username}:</strong> ${message}<br>`;
    p.className = "in_message";
    div.appendChild(p);
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
        } else if (cups == true){ // Cups
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
                socket.emit('cups_commad', {username: author, message: string})
            };

        } else { 
            // Send message
            socket.emit('new_message', {username: username, message: message});
        };
    };
    slashCommands(message, username);
}

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

socket.on("cups_back", (data) =>{
    createMessage(data.author, data.message);
});

socket.on("new_message", (data) => {
    createMessage(data.username, data.message);
    var div = document.getElementById('messages');
    div.scrollBy(0, 100);
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
});


// Exit user
socket.on("udisconnect", (data) => {
    var users = document.getElementById('users_online');
    users.innerHTML = `🟢 Online: ${data.users}`
    createMessage("Server", `<i>${data.id}</i> Вышел из чата`);
    var div = document.getElementById("messages");
    div.scrollBy(0, 100);
});

// Sticks
socket.on("sticker_back", (data) => {
    createMessage(data.name, data.text);
    var div = document.getElementById('messages');
    div.scrollBy(0, 100);
});


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


function stickerSend(stick){
    var uname = document.getElementById('username');
    var username = uname.value;
    if (username == ""){
        username = "%USERNAME%";
    };

    socket.emit("sticker_send", {author: username, name: stick});
}
