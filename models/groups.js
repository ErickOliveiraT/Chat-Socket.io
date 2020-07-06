const database = require('./database');

function createGroup(group) {
    return new Promise(async (resolve, reject) => {
        let con = await database.getConnection();
        
        con.connect(function(err) {
            if (err) reject({ created: false, error: err });
            var sql = `INSERT INTO groups(name, owner) VALUES('${group.name}','${group.owner}')`;
            con.query(sql, function (err, result) {
                if (err) {
                    let error = err;
                    if (err.code == 'ER_DUP_ENTRY') error = 'Grupo já existente';
                    if (err.code == 'ER_NO_REFERENCED_ROW_2') error = 'Usuário owner não existe';
                    reject({ created: false, error: error });
                }
                resolve({created: true});
            });
        });
    });
}

function removeGroup(group) {
    return new Promise(async (resolve, reject) => {
        let con = await database.getConnection();

        con.connect(function (err) {
            if (err) reject({ created: false, error: err });
            var sql = `DELETE FROM groups WHERE name = '${group.name}'`;

            con.query(sql, function (err, result) {
                if (err) reject({ removed: false, error: err });
                resolve({ removed: true });
            });
        });
    });
}

function isInGroup(user, group) {
    return new Promise(async (resolve, reject) => {
        let con = await database.getConnection();
        
        con.connect(function(err) {
            if (err) reject(false);
            var sql = `SELECT * FROM group_user WHERE group_name = '${group}' AND user_email = '${user}';`;
            con.query(sql, function (err, result) {
                if (err) reject(false)
                if (result.length > 0) resolve(true);
                else resolve(false);
            });
        });
    });
} 

function addUser(info) {
    return new Promise(async (resolve, reject) => {
        let con = await database.getConnection();
        const inGroup = await isInGroup(info.email, info.group);
        if (inGroup) return reject({added: false, error: 'Usuário já está nesse grupo'});
        
        con.connect(function(err) {
            if (err) reject({ added: false, error: err });
            var sql = `INSERT INTO group_user(group_name, user_email) VALUES('${info.group}','${info.email}')`;
            con.query(sql, function (err, result) {
                if (err) {
                    let error = err;
                    if (err.code == 'ER_NO_REFERENCED_ROW_2') error = 'Email ou grupo inexistente(s)';
                    reject({ added: false, error: error });
                }
                resolve({added: true});
            });
        });
    });
}

function removeUser(info) {
    return new Promise(async (resolve, reject) => {
        let con = await database.getConnection();
        const inGroup = await isInGroup(info.email, info.group);
        if (!inGroup) return reject({removed: false, error: 'Usuário não está nesse grupo'});
        
        con.connect(function(err) {
            if (err) reject({ removed: false, error: err });
            var sql = `DELETE FROM group_user WHERE group_name = '${info.group}' AND user_email = '${info.email}'`;
            con.query(sql, function (err, result) {
                if (err) reject({ removed: false, error: err });
                resolve({removed: true});
            });
        });
    });
}

function getGroups(user) {
    return new Promise(async (resolve, reject) => {
        let con = await database.getConnection();
        
        con.connect(function(err) {
            if (err) reject(null);
            var sql = `SELECT group_name FROM group_user WHERE user_email = '${user}';`;
            con.query(sql, function (err, result) {
                if (err) reject(null)
                let groups = new Array();
                if (result.length > 0) {
                    result.forEach(group => {
                        groups.push(group.group_name);
                    });
                }
                resolve({groups});
            });
        });
    });
}

module.exports = { createGroup, removeGroup, addUser, isInGroup, removeUser, getGroups}