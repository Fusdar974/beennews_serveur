'use strict';

const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
    try {

        if (req.method !== 'OPTIONS') {

            const { token } = req.query;
            const tokenVerify = jwt.verify(token, 'NOUVELLE_CHAINE_SECRETE_DE_MALADE');
            let { nom, prenom, donnees } = tokenVerify;
            req.user = { nom, prenom, donnees };

        }
        next();

    } catch (err) {
        res.send(`Vous n'avez pas le droit de générer un PDF`);
    }
}

