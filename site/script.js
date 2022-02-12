const socket = io.connect("https://object-node.herokuapp.com");

socket.on("connect", () => {
    console.log("Connected!");
});


// METHODS
function createMessage(username, message){
    var div = document.getElementById("messages");
    var p = document.createElement('p');
    p.innerHTML = `<strong>${username}:</strong> ${message}<br>`;
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

    socket.emit('new_message', {username: username, message: message});
}

socket.on("new_message", (data) => {
    createMessage(data.username, data.message);
    var div = document.getElementById('messages');
    div.scrollBy(0, 50);
});


// New user
socket.on("new_user", (data) => {
    var name = document.getElementById('username');
    var username = name.value;

    var users = document.getElementById('users_online');
    users.innerHTML = `🟢 Online: ${data.users}`

    if (username != ""){
        createMessage("Server", `Подключается новый пользователь <i>${username}</i> | ID: ${data.id}`);
    } else{
        createMessage("Server", `Подключается новый пользователь <i>%USERNAME%</i> | ID: ${data.id}`);
    };

});

// Load messages
socket.on("new_user_socket", (data) => {
    var div = document.getElementById("messages");
    var p = document.createElement('p');
    p.innerHTML = data.messages;
    div.appendChild(p);
});



// Exit user
socket.on("udisconnect", (data) => {
    var users = document.getElementById('users_online');
    users.innerHTML = `🟢 Online: ${data.users}`
    createMessage("Server", `<i>${data.id}</i> Вышел из чата`);
});
