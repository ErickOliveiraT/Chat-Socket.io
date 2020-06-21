const express = require('express');
const socket = require('socket.io');
const md5 = require('md5');
const cors = require('cors');
const users = require('./models/users');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/', express.static('public'));

// -----------SUGESTÃO: ------------
/* 
Se não quiser implementar login com token pra n ter esse trabalho 
substitui a rota principal '/' por '/chat' e a de login '/login' para '/'
quando o usuario acessar localhost:4000/ vai para pagina de login
daí no front quando usuario fazer login eu chamo /authenticate 
e se tiver valido guardo o id do usuario voce que retornar e o front redireciona para '/chat',
no '/chat' eu dou um get em '/user/:id/groups' passando o id do usuario e voce me 
retorna os grupos que ele faz parte pra eu montar a tela
*/

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/public/index.html');
});

app.get('/login', function (req, res) {
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

// rota de criar grupo
app.post('/group', function (res, res) {
    // RECEBE: {name: 'Grupo 1', owner: 'bruno123'}
    // CRIA GRUPO NO BANCO e adiciona no grupo o usuario owner
    // RETORNA: {created: true, groupId} ou {created: false}
    res.send({ created: true });
});

// rota de adicionar usuario no grupo
app.post('/group/user/add', function (res, res) {
    // RECEBE: {email, group} // email do usuario e grupo que sera alocado
    // adiciona usuario no grupo
    // RETORNA: {added: true} ou {added: false}
    res.send({ added: true });
});

// rota de remover usuario do grupo
app.delete('/group/:groupId/user/:userId', function (res, res) {
    // RECEBE: no req.params o groupId (id do grupo que usuario ira sair) e o userId (usuario que vai sair do grupo do groupId passado)
    // pega usuario e tira do grupo
    // RETORNA: {removed: true}  
    res.send({ removed: true });
});

// rota de buscar os grupos que o usuario faz parte
// uso essa rota quando usuario entra na pagina do chat para preencher os grupos da tela
app.get('/user/:userId/groups', function (res, res) {
    // RECEBE: no req.params o userId do usuario e retorna o nome dos grupos que ele faz parte
    // pega nome dos grupos que o usuario faz parte
    // RETORNA: {groups: ['grupo 1', 'grupo 2']}  
    res.send({ groups: ['grupo 500'] });
});

// rota para salvar mensagem
app.post('/message', function (res, res) {
    // RECEBE: {message: 'conteudo mensagem', userId: 1, groupName: 'grupo 2'}
    // salva mensagem
    // RETORNA: {saved: true} ou {saved:false}
    res.send({ saved: true });
});

// rota para pegar mensagens do grupo
// uso quando o usuario seleciona um grupo eu pego as mensagens anteriores
app.get('/group/:groupId/messages', function (res, res) {
    // RECEBE: groupId no req.params
    // busca mensagens(acho que pode ser as ultimas 30 sei la) do grupo, retorna quem mandou(userSent), e a mensagem(msg)
    // RETORNA: {messages: [{userSent: 'joao', msg: 'conteudo mensagem'}]} ou {saved:false}
    res.send({ messages: [{ userSent: 'joao', msg: 'conteudo mensagem' }] });
});

const server = app.listen(4000, function () {
    console.log('Listening on port 4000');
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