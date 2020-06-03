const express = require('express');
const socket = require('socket.io');
const md5 = require('md5');
const cors = require('cors');
const users = require('./models/users');

const app = express();
const server = app.listen(4000, function() {
    console.log('Listening on port 4000');
});

const router = express.Router();
app.use(cors());
app.use(express.json())
app.use('/', router);
app.use(express.static('public'));


app.post('/autenticate', (req,res) => { //Autentica um usuário
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

io.on('connection', function(socket) {
    console.log(`Um cliente se conectou!\tid = ${socket.id}`);
    
    socket.on('chat', function(data) {
        io.sockets.emit('chat', data);
    })
});