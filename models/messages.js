const database = require('./database');
const users = require('./users');

function saveMessage(msg) {
    return new Promise(async (resolve, reject) => {
        if(msg.message.length == 0) return reject({saved: false, error: 'Mensagem vazia'});
        let con = await database.getConnection();
        
        con.connect(function(err) {
            if (err) reject({saved: false, error: err});
            var sql = `INSERT INTO messages(user_email, group_name, message) VALUES('${msg.userEmail}','${msg.groupName}','${msg.message}')`;
            con.query(sql, function (err, result) {
                if (err) {
                    let error = err;
                    if (err.code == 'ER_NO_REFERENCED_ROW_2') error = 'Email ou grupo inexistente(s)';
                    return reject({ saved: false, error: error });
                }
                resolve({saved: true});
            });
        });
    });
}

function getMessages(groupName) {
    return new Promise(async (resolve, reject) => {
        let con = await database.getConnection();
        
        con.connect(async (err) => {
            if (err) return reject({messages: [], error: err});
            var sql = `SELECT user_email, message FROM messages WHERE group_name = '${groupName}'`;
            con.query(sql, async (err, result) => {
                if (err) return reject({messages: [], error: err});
                if (result.length == 0) return resolve({messages: result});
                let messages = new Array();
                const names = await users.getNames(result);
                for (let i = 0; i < result.length; i++) {
                    let email = result[i].user_email;
                    let msg = result[i].message;
                    messages.push({userSent: names[email], msg: msg});
                }
                resolve({messages}); 
            });
        });
    });
}

module.exports = {saveMessage, getMessages}