let socket = io.connect('http://localhost:4000');

let message = document.getElementById('message');
let handle = document.getElementById('handle');
let btn = document.getElementById('send');
let output = document.getElementById('output');

if (!localStorage.getItem('token')) {
    window.location.href('http://localhost:4000/login')
}

const user = {
    email: localStorage.getItem('logged_user_email'),
    name: localStorage.getItem('logged_user_name')
}

socket.on('chat', function (data) {
    console.log('on: ', data);
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});

socket.on('remove_group', function (data) {
    console.log('group removed')
    $(`button[id="${data.group}"]`).remove();
    output.innerHTML += '<p><strong>' + data.handle + ': </strong> removeu o grupo ' + data.group + '</p>';
});

socket.on('member_added', function (data) {
    console.log('member added ' + data.group + ' ' + data.userEmail)
    if (data.userEmail === user.email) {
        $('#groups').append(`<button class="group" id="${data.group}">${data.group}</button>`).unbind().on('click', chooseGroup);
        output.innerHTML += '<p><strong>' + user.name + ': </strong> você foi adicionado no o grupo: ' + data.group + '</p>';
    }
});

socket.on('member_removed', function (data) {
    console.log('member removed ' + data.group + ' ' + data.userEmail)
    $(`button[id="${data.group}"]`).remove();
    if (data.userEmail === user.email) {
        $(`button[id="${data.group}"]`).remove();
        output.innerHTML += '<p><strong>' + user.name + ': </strong> você foi removido do grupo ' + data.group + '</p>';
    }
});

let currentGroup = "";
// fetch(`http://localhost:4000/group/${currentGroup}/messages`).then(res => {
//     return res.json();
// }).then(data => {
//     output.innerHTML = "";
//     data.messages.map(messageObj => {
//         output.innerHTML += '<p><strong>' + messageObj.userSent + ': </strong>' + messageObj.msg + '</p>';
//     })
// }).catch(err => {
//     console.log('Erro Mensagens do Grupo: ', err);
// })

$('.handle_name').text(user.name);

console.log("Email Logado: ", user.email);

// pega todos os grupos do usuario para montar tela
fetch(`http://localhost:4000/user/${user.email}/groups`).then(res => {
    return res.json();
}).then(data => {
    console.log('Groups');
    console.log(data.groups);
    data.groups.forEach(groupName => {
        $('#groups').append(`<button class="group" id="${groupName}">${groupName}</button>`).unbind().on('click', chooseGroup);
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

