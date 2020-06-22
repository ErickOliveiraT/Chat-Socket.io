const cred = require('../credencials');
const jwt = require('jsonwebtoken');

//Gera um Json Web Token
function getJWT(login) {
    const token = jwt.sign({login: login}, cred.secret, {expiresIn: 86400});
    return token;
}

//Retorna o dono de um JWT
function getJWTOwner(token) {
    let owner = null;
    jwt.verify(token, cred.secret, (err, dec) => {
        if (err) return err;
        owner = dec.login;
    });
    return owner;
}

//Checa se um JWT pertence a um usuário
async function checkJWT(user, token) {
    try {
        const owner = await getJWTOwner(token);
        if (!owner || owner == null || owner == undefined || owner === undefined) return false;
        return (owner==user);
    } catch {
        return false;
    }
}

module.exports = {checkJWT, getJWT}