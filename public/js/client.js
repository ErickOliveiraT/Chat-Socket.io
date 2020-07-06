let socket = io.connect('http://localhost:4000');

let message = document.getElementById('message');
let handle = document.getElementById('handle');
let btn = document.getElementById('send');
let output = document.getElementById('output');

socket.on('chat', function (data) {
    console.log('on: ', data);
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

const user = {
    email: localStorage.getItem('logged_user_email'),
    name: localStorage.getItem('logged_user_name')
}
let currentGroup = "Group 1";
fetch(`http://localhost:4000/group/${currentGroup}/messages`).then(res => {
    return res.json();
}).then(data => {
    output.innerHTML = "";
    data.messages.map(messageObj => {
        output.innerHTML += '<p><strong>' + messageObj.userSent + ': </strong>' + messageObj.msg + '</p>';
    })
}).catch(err => {
    console.log('Erro Mensagens do Grupo: ', err);
})

$('#handle').val(user.name);

console.log("Email Logado: ", user.email);

// pega todos os grupos do usuario para montar tela
fetch(`http://localhost:4000/user/${user.email}/groups`).then(res => {
    return res.json();
}).then(data => {
    console.log('Groups');
    console.log(data.groups);
    data.groups.forEach(groupName => {
        $('#groups').append(`<button class="group" id="${groupName}">${groupName}</button>`).on('click', chooseGroup);
    })
}).catch(err => {
    console.log('Erro ao buscar grupo: ' , err);
})

btn.addEventListener('click', function (e) {
    e.preventDefault();
    console.log('Emit: ', {
        message: message.value,
        handle: user.name,
        group: currentGroup
    })
    socket.emit('chat', {
        message: message.value,
        handle: user.name,
        group: currentGroup
    });
    // salva mensagem
    console.log(JSON.stringify({
        user: user.email,
        groupName: currentGroup,
        message: message.value
    }));
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    fetch(`http://localhost:4000/message`, {
        method: 'POST',
        body: JSON.stringify({
            user: user.email,
            groupName: currentGroup,
            message: message.value
        }),
        headers: myHeaders
    }).then(res => {
        return res.json();
    }).then(data => {
        console.log(data);
    }).catch(err => {
        console.log('Não salvou: ', err);
    })
    message.value = "";
});

