const $groupButtons = $('button.group');

const $openCreateGroupModalBtn = $('#create_group_btn');
const $openAddUserModalBtn = $('#add_user_group_btn');
const $openRemoveUserModalBtn = $('#remove_user_group_btn');

const $createGroupModal = $('#create_group_modal');
const $addUserGroupModal = $('#add_user_group_modal');
const $removeUserGroupModal = $('#remove_user_group_modal');

const $removeGroupBtn = $('#remove_group');
const $createCreateGroupBtn = $('#submit_group');
const $addUserGroupBtn = $('#submit_add_user');
const $removeUserGroupBtn = $('#submit_remove_user');

// choose group event
const chooseGroup = (e) => {
    e.preventDefault();
    $('button.group').removeClass('group-active');
    $(e.target).addClass('group-active');

    // send the name of the group chosen to server
    const newGroupName = e.target.id;
    socket.emit('change_group', { handle: user.name, oldGroup: currentGroup, newGroup: newGroupName });
    currentGroup = newGroupName;
    // pega mensagens anteriores do grupo
    getMessages();
}

const getMessages = () => {
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
}

for (let $groupButton of $groupButtons)
    $groupButton.unbind().on('click', chooseGroup);

const openModal = (e, modalSelector) => {
    e.preventDefault();
    closeAllModals();
    modalSelector.removeClass('hide');
    modalSelector.addClass('show');
}

const closeAllModals = () => {
    $('.modal').removeClass('hide');
    $('.modal').removeClass('show');
    $('.modal').addClass('hide');
}

// open create group modal event
$openCreateGroupModalBtn.on('click', (e) => { openModal(e, $createGroupModal) });
$openAddUserModalBtn.on('click', (e) => {openModal(e, $addUserGroupModal)});
$openRemoveUserModalBtn.on('click', (e) => {openModal(e, $removeUserGroupModal)});


// create new group
$createCreateGroupBtn.on('click', (e) => {
    e.preventDefault();
    const groupName = $('#group_name').val();
    console.log(groupName);
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    fetch('http://localhost:4000/group', {
        method: 'POST',
        body: JSON.stringify({
            name: groupName,
            owner: user.email
        }),
        headers: myHeaders
    })
    .then(res => res.json())
    .then(data => {
        socket.emit('change_group', { handle: user.name, oldGroup: currentGroup, newGroup: groupName });
        currentGroup = groupName;
        $('button.group').removeClass('group-active');
        $('#groups').append(`<button class="group group-active" id="${groupName}">${groupName}</button>`).on('click', chooseGroup);
        output.innerHTML = "";
    })
    $createGroupModal.removeClass('show');
    $createGroupModal.addClass('hide');
});

// remove group
$removeGroupBtn.on('click', (e) => {
    e.preventDefault();
    $(`#${currentGroup}`).remove();
    fetch(`http://localhost:4000/group/${currentGroup}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(res => {
            console.log($(`button[id="${currentGroup}"]`))
            socket.emit('remove_group', { group: currentGroup, handle: user.name });
        }).catch(err => {
            console.log('Erro ao remover Usuario: ', userEmail);
        })
})

// add user in group
$addUserGroupBtn.on('click', (e) => {
    e.preventDefault();
    const userEmail = $('#add_user_email').val();
    let myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    console.log(userEmail);
    fetch(`http://localhost:4000/group/user/add`, {
        method: 'POST',
        body: JSON.stringify({
            email: userEmail,
            group: currentGroup
        }),
        headers: myHeaders
    })
        .then(res => res.json())
        .then(res => {
            console.log('Usuario Adicionado');
            socket.emit('member_added', {userEmail, group: currentGroup});
            closeAllModals();
        }).catch(err => {
            console.log('Erro ao adicionar Usuario: ', userEmail);
            closeAllModals();
        })
})

$removeUserGroupBtn.on('click', (e) => {
    e.preventDefault();
    const userEmail = $('#remove_user_email').val();
    console.log(userEmail);
    fetch(`http://localhost:4000/group/${currentGroup}/user/${userEmail}`, { method: 'DELETE' })
        .then(res => res.json())
        .then(res => {
            console.log('Usuario Removido.');
            socket.emit('member_removed', { userEmail, group: currentGroup });
            closeAllModals();
        }).catch(err => {
            console.log('Erro ao remover Usuario: ', userEmail);
            closeAllModals();
        })
})

// close any modal
$('.close_modal').on('click', (e) => { 
    e.preventDefault();
    closeAllModals();
})


