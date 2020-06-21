let currentGroup = "grupo1";

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
    socket.emit('change_group', { handle: handle.value, oldGroup: currentGroup, newGroup: newGroupName });
    currentGroup = newGroupName;
    // pega mensagens anteriores do grupo
    // fetch(/group/:groupId/messages)
}

$groupButtons.on('click', chooseGroup);

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
    $('#groups').append(`<button class="group" id="${groupName}">${groupName}</button>`).on('click', chooseGroup);
    // fetch('/group',{method: post}, { groupName, myId })
    //     .then(res => res.json())
    //     .then(res => {
    //         // cria novo botao de grupo
    //     })
    $createGroupModal.removeClass('show');
    $createGroupModal.addClass('hide');
});

// remove group
$removeGroupBtn.on('click', (e) => {
    e.preventDefault();
    $(`#${currentGroup}`).remove();
        // fetch('', { groupName })
    //     .then(res => res.json())
    //     .then(res => {
    //         // remove grupo
    //     })
})

// add user in group
$addUserGroupBtn.on('click', (e) => {
    e.preventDefault();
    const userEmail = $('#add_user_email').val();
    console.log(userEmail);
    // fetch('', {email, groupId})
    // recebe added: true ou false
})

$removeUserGroupBtn.on('click', (e) => {
    e.preventDefault();
    const userEmail = $('#remove_user_email').val();
    console.log(userEmail);
    // fetch('', {email, groupId})
    // recebe removed: true ou false
})

// close any modal
$('.close_modal').on('click', (e) => { 
    e.preventDefault();
    closeAllModals();
})


