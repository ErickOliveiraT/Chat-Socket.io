const express = require('express');
const socket = require('socket.io');
const md5 = require('md5');
const cors = require('cors');
const users = require('./models/users');
const groups = require('./models/groups');
const messages = require('./models/messages');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', express.static('public'));

// Tela inicial do chat
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

// Tela de login
app.get('/login', function (req, res) {
    res.sendFile(__dirname + '/public/login/login.html');
});

// Rota de autenticação
app.post('/authenticate', cors(), async (req,res) => { 
    const user = {
        login: req.body.login,
        password_hash: md5(req.body.password)
    };
    console.log('localhost:4000/authenticate method=POST');
    console.log('Login: ', user);
    

    try {
        const response = await users.authenticate(user);
        if (response.valid) return res.status(200).send(JSON.stringify(response));
        res.status(400).send(JSON.stringify(response));
    } catch (error) {
        res.status(500).send(error);
    }
});

// Rota para adicionar usuário
app.post('/user/add', cors(), async (req,res) => { 
    const user = {
        email: req.body.email,
        name: req.body.name,
        password_hash: md5(req.body.password)
    };
    console.log('\nlocalhost:4000/user/add method=POST');
    console.log('Cria Usuario: ', user);
    
    try {
        const response = await users.storeUser(user);
        if (response.added) return res.status(200).send(JSON.stringify(response));
        res.status(400).send(JSON.stringify(response));
    } catch (error) {
        res.status(500).send(error);
    }
});

// Rota de criação de grupo
app.post('/group', async (req, res) => {
    const group = {
        name: req.body.name,
        owner: req.body.owner
    }
    console.log('\nlocalhost:4000/group method=POST');
    console.log('Cria Grupo: ', group);
    
    try {
        const response = await groups.createGroup(group);
        if (response.created) {
            const _response = await groups.addUser({email: group.owner, group: group.name});
            if (_response.added) return res.status(200).send(JSON.stringify(response));
            else return res.status(200).send(JSON.stringify({status: 'WARNING', created: true, added: false}))
        }
        res.status(400).send(JSON.stringify(response));
    } catch (error) {
        res.status(400).send(error);
    }
});

// Rota para remoção de grupo
app.delete('/group/:groupName', async (req, res) => {
    const group = { name: decodeURI(req.params.groupName) }
    console.log('\nlocalhost:4000/group/:groupName method=DELETE');
    console.log('Deleta Grupo: ', group);
    

    try {
        const response = await groups.removeGroup(group);
        if (response.removed) return res.status(200).send(JSON.stringify(response));
        res.status(400).send(JSON.stringify(response));
    } catch (error) {
        res.status(400).send(error);
    }
});

// Rota para adicionar usuario no grupo
app.post('/group/user/add', async (req, res) => {
    const info = {
        email: req.body.email,
        group: req.body.group
    }
    console.log('\nlocalhost:4000/group/user/add method=POST');
    console.log('Adiciona Membro: ', info);
    

    try {
        const response = await groups.addUser(info);
        if (response.added) return res.status(200).send(JSON.stringify(response));
        res.status(400).send(JSON.stringify(response));
    } catch (error) {
        res.status(400).send(error);
    }
});

// Rota para remover usuario do grupo
app.delete('/group/:groupName/user/:userEmail', async (req, res) => {
    const info = {
        email: req.params.userEmail,
        group: req.params.groupName
    }
    console.log('\nlocalhost:4000/group/:groupName/user/:userEmail method=DELETE');
    console.log('Remove Membro: ', info);
    
    try {
        const response = await groups.removeUser(info);
        if (response.removed) return res.status(200).send(JSON.stringify(response));
        res.status(400).send(JSON.stringify(response));
    } catch (error) {
        res.status(400).send(error);
    }
});

// Rota para buscar os grupos que o usuario faz parte
// Uso essa rota quando usuario entra na pagina do chat para preencher os grupos da tela
app.get('/user/:userEmail/groups', async (req, res) => {
    const userEmail = req.params.userEmail;
    try {
        const response = await groups.getGroups(userEmail);
        console.log('\nlocalhost:4000/user/:userEmail/groups method=GET');
        console.log('Pega Grupos do Usuario: ', response);
        
        
        res.status(200).send(JSON.stringify(response));
    } catch (error) {
        res.status(400).send(error);
    }
});

// Rota para salvar mensagem
app.post('/message', async (req, res) => {
    const msg = {
        userEmail: req.body.user,
        groupName: req.body.groupName,
        message: req.body.message
    }
    console.log('\nlocalhost:4000/message method=POST');
    console.log('Salva Mensagem: ', msg);
    
    try {
        const response = await messages.saveMessage(msg);
        if (response.saved) return res.status(200).send(JSON.stringify(response));
        res.status(400).send(JSON.stringify(response));
    } catch (error) {
        res.status(400).send(error);
    }
});

// Rota para pegar mensagens do grupo
// Uso quando o usuario seleciona um grupo eu pego as mensagens anteriores
app.get('/group/:groupName/messages', async (req, res) => {
    const groupName = req.params.groupName;
    try {
        const response = await messages.getMessages(groupName);
        console.log('\nlocalhost:4000/group/:groupName/messages method=GET');
        console.log('Pega Mensagens do Grupo: ', response);
        
        if(!response.error) return res.status(200).send(JSON.stringify(response));
        res.status(200).send(JSON.stringify(response));
    } catch (error) {
        res.status(400).send(error);
    }
});

const server = app.listen(4000, function () {
    console.log('Listening on port 4000');
});

var io = socket(server);

io.on('connection', function (socket) {
    // quando começa o chat já entra no grupo geral

    console.log(`Um cliente se conectou!\tid = ${socket.id}`);
    
    socket.on('chat', function (data) {
        console.log('Mensagem Enviada: ', data)
        io.sockets.to(data.group).emit('chat', data);
    })

    socket.on('remove_group', function (data) {
        console.log('Remove Grupo: ', data)
        io.sockets.emit('remove_group', data);
    })

    socket.on('member_removed', function (data) {
        console.log('Remove Membro: ', data)
        socket.broadcast.emit('member_removed', data);
    })
    
    socket.on('member_added', function (data) {
        console.log('Adiciona Membro: ', data)
        socket.broadcast.emit('member_added', data);
    })
    socket.on('change_group', function (data) {
        if (data.oldGroup !== data.newGroup) {
            socket.leave(data.oldGroup);
            // socket.broadcast.to(data.oldGroup).emit('chat', { handle: data.handle, message: `${data.handle} saiu do grupo` });
            socket.join(data.newGroup);
            // socket.broadcast.to(data.newGroup).emit('chat', { handle: data.handle, message: `${data.handle} entrou no grupo` });
            console.log(`${data.handle} trocou do grupo ${data.oldGroup} para ${data.newGroup}`);
        }
    })
});