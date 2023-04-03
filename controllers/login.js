'use strict';

const express = require('express');
const router = express.Router();
const bdd = require('../bdd');
const jwt = require('jsonwebtoken');
const droits = require('./droits');
const profils = require('./profils');
const crypto = require('crypto');





router.post('/', (req, res) => {

  let requete = { nom: req.body.login, isDesactive: false};

  if (process.env.NODE_ENV !== 'development') {
    requete.password = crypto.pbkdf2Sync(req.body.password, "saltsuprise", 100, 64, 'sha512').toString('hex');
  }
  bdd.utilisateur.findOne(requete, (err, user) => {
    if (user) {

      const profilsUser = profils.filter(item => user.profils.filter(item2 => item2._id === item._id).length > 0);
      let menus = [];
      profilsUser.forEach(item => {
        menus = menus.concat(item.menus);
      })
      menus = [...new Set(menus)];
      menus.sort();

      const reponse = {
        token: jwt.sign(
          {
            userId: user._id,
            nom: user.nom,
            prenom: user.prenom,
            droits: droits.filter(item => menus.indexOf(item._id) >= 0),
            compte: user.compte
          },
          'CHAINE_SECRETE_DE_MALADE',
          { expiresIn: '24h' }
        )
      }
      res.status(200).json(reponse);
    } else {
      console.log(`ERREUR /login utilisateur ${req.body.login} non trouvé`);
      res.status(403).json({ err: 'ERREUR' });
    }
  });
});

module.exports = router;
