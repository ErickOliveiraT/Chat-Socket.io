let socket = io.connect('http://localhost:4000');

let message = document.getElementById('message'),
handle = document.getElementById('handle'),
btn = document.getElementById('send'),
    output = document.getElementById('output');

socket.on('chat', function (data) {
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

// pega todos os grupos do usuario para montar tela
// fetch(/user/:userId/groups)
// $('#groups').append(`<button class="group" id="${groupName}">${groupName}</button>`).on('click', chooseGroup);

btn.addEventListener('click', function (e) {
    e.preventDefault();
    socket.emit('chat', {
        message: message.value,
        handle: handle.value,
        group: currentGroup
    });
    // salva mensagem
    // fetch(/message)
    message.value = "";
});

