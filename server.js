const express = require('express');
const path =  require('path');
const socket = require('socket.io');
const md5 = require('md5');
const cors = require('cors');
const users = require('./models/users');

const app = express();
const server = app.listen(4000, function() {
    console.log('Listening on port 4000');
});

const router = express.Router();
app.use(cors())
app.use(express.json())
app.use('/', router);
app.use(express.static('public'));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', function(req, res) {
    res.sendFile(__dirname + '/public/login/login.html');
});

app.post('/autenticate', cors(), (req,res) => { //Autentica um usuário
    const user = {
        login: req.body.login,
        password_hash: md5(req.body.password)
    };
    console.log(user)
    users.autenticate(user)
    .then((response) => {res.send(JSON.stringify(response));})
    .catch((error) => {res.status(400).send(error)});
});


var io = socket(server);

io.on('connection', function (socket) {
    // quando começa o chat já entra no grupo geral
    socket.join("grupo1");

    console.log(`Um cliente se conectou!\tid = ${socket.id}`);
    
    socket.on('chat', function (data) {
        io.sockets.to(data.group).emit('chat', data);
    })

    socket.on('change_group', function (data) {
        socket.leave(data.oldGroup);
        socket.broadcast.to(data.oldGroup).emit('chat', { handle: data.handle, message: `${data.handle} saiu do grupo` });
        socket.join(data.newGroup);
        socket.broadcast.to(data.newGroup).emit('chat', { handle: data.handle, message: `${data.handle} entrou no grupo` });
        console.log(`${data.handle} saiu do grupo ${data.oldGroup} entrou em ${data.newGroup}`);
    })
});