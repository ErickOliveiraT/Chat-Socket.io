const cred = require('../credencials')
const mysql = require('mysql')

module.exports = {

    autenticate(user) {
        return new Promise((resolve) => {
            var con = mysql.createConnection({
                host: cred.host,
                user: cred.user,
                password: cred.password,
                database: cred.database
            });

            con.connect(function (err) {
                if (err) resolve({ valid: false, error: err });
                var sql = `SELECT password,name FROM users WHERE email = '${user.login}'`
                con.query(sql, async function (err, result) {
                    if (err) resolve({ valid: false, error: err });
                    if (result[0] == undefined || result[0] === undefined) resolve({ valid: false, error: "Usuário não existe" });
                    else {
                        if (result[0].password === user.password_hash) { //Senha certa
                            resolve({ valid: true, name: result[0].name });
                        } else { //Senha errada
                            resolve({ valid: false, error: "Senha incorreta" })
                        }
                    }
                });
            });
        });
    }
}