'use strict';

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    try {

        if (req.method !== 'OPTIONS') {

            const token = req.headers.authorization.split(' ')[1];
            const tokenVerify = jwt.verify(token, 'CHAINE_SECRETE_DE_MALADE');

            let { userId, nom, prenom } = tokenVerify;
            req.user = { userId, nom, prenom };

        }
        next();

    } catch (err) {

        console.log('auth', err);
        res.status(401).json({
            error: new Error('Invalid request!')
        });
    }
}

