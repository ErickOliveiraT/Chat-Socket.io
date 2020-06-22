const database = require('./database');
const token = require('./token');

function authenticate(user) {
    return new Promise(async (resolve) => {
        let con = await database.getConnection();

        con.connect(function (err) {
            if (err) resolve({ valid: false, error: err });
            var sql = `SELECT password,name FROM users WHERE email = '${user.login}'`
            con.query(sql, async function (err, result) {
                if (err) resolve({ valid: false, error: err });
                if (result[0] == undefined || result[0] === undefined) resolve({ valid: false, error: "Usuário não existe" });
                else {
                    if (result[0].password === user.password_hash) { //Senha certa
                        const tk = token.getJWT(user.login);
                        resolve({ valid: true, name: result[0].name, token: tk});
                    } else { //Senha errada
                        resolve({ valid: false, error: "Senha incorreta" })
                    }
                }
            });
        });
    });
}

function getUser(email) {
    return new Promise(async (resolve) => {
        let con = await database.getConnection();

        con.connect(function (err) {
            if (err) resolve(null);
            var sql = `SELECT * FROM users WHERE email = '${email}'`
            con.query(sql, async function (err, result) {
                if (err) resolve(null);
                resolve(result[0]);
            });
        });
    });
}

async function getNames(data) {
    let emails = new Array();
    let map = new Object();
    data.forEach(msg => {
        if (emails.indexOf(msg.user_email) == -1) emails.push(msg.user_email);
    });
    for (let i = 0; i < emails.length; i++) {
        let userInfo = await getUser(emails[i]);
        map[emails[i]] = userInfo.name;
    }
    return map;
}

module.exports = {authenticate, getNames}