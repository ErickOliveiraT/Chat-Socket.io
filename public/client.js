var socket = io.connect('http://localhost:4000');

var message = document.getElementById('message'),
handle = document.getElementById('handle'),
btn = document.getElementById('send'),
    output = document.getElementById('output');

var currentGroup = "grupo1";

btn.addEventListener('click', function (e) {
    e.preventDefault();
    socket.emit('chat', {
        message: message.value,
        handle: handle.value,
        group: currentGroup
    });
    message.value = "";
});

const $groupButtons = $('button.group');
$groupButtons.on('click', (e) => {
    e.preventDefault();
    $groupButtons.removeClass('group-active');
    $(e.target).addClass('group-active');

    //muda de grupo 
    const newGroupName = e.target.id;
    socket.emit('change_group', { handle: handle.value, oldGroup: currentGroup, newGroup: newGroupName});
    currentGroup = newGroupName;
})

socket.on('chat', function(data) {
    output.innerHTML += '<p><strong>' + data.handle + ': </strong>' + data.message + '</p>';
});