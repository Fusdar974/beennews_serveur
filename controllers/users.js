'use strict';

const express = require('express');
const router = express.Router();
const bdd = require('../bdd');
const droits = require('./droits');
const profils = require('./profils');
const Helpers = require('../helpers/helpers');
const Mail = require('../helpers/envoyerMail');
const { offrir } = require('./metier');

/**
 * Récupération d'un utilisateur
 */
router.get('/:id', (req, res) => {
  bdd.utilisateur.findOne({ _id: req.params.id }, function (err, doc) {
    if (doc) {
      res.json({ user: doc });
    } else {
      res.sendStatus(401);
    }
  });
});

/**
 * Historique d'un utilisateur
 */
router.get('/historique/:type/:id', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const nombre = req.query.nombre || 10;
  bdd.historique.count({ client: req.params.id, type: req.params.type }, function (err, count) {
    bdd.historique.find({ client: req.params.id, type: req.params.type }).sort({ date: -1 }).skip((page - 1) * nombre).limit(nombre).exec((err, histo) => {
      res.json({ histo, count, page, nombre });
    });
  })
})

/**
 * Mise à jour d'un utilisateur
 */
router.put('/:id', (req, res) => {
  bdd.utilisateur.update({ _id: req.params.id }, { $set: req.body.user }, {}, function (err, doc) {
  console.log(req)
    if (req.body.user.profils.find(item => item.nom === 'Torréfacteur')) {
      console.log('Il consomme du café');
    } else {
      console.log('Il ne consomme pas du café');
    }

    res.json({ user: doc });
    
  });
})

/**
 * Suppression d'un utilisateur
 */
router.delete('/:id', (req, res) => {
  bdd.utilisateur.remove({ _id: req.params.id }, function (err, doc) {
    res.json({ user: doc });
  });
})

/**
 * Création d'un utilisateur
 */
router.post('/create', (req, res) => {
  let user = req.body.user;
  user.compte = 0;
  user.supprimable = true;
  user.isDesactive = false;
  bdd.utilisateur.insert(user, function (err, doc) {
    res.json({ user: doc });
  });
})

router.post('/genererNewPwd/:id', (req, res) => {

  const newpassword = Helpers.genererNouveauMotDePasse();
  const password = Helpers.motDePasse(newpassword);

  const regExpMail = /^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$/i;

  if (req.body.mail.match(regExpMail) !== null) {
    bdd.utilisateur.update(
      { _id: req.params.id },
      { $set: { password } },
      { returnUpdatedDocs: true },
      (err, numUser, userUpdated) => {

        Mail.envoyerMail({
          from: 'SOUM',
          to: req.body.mail,
          subject: 'Nouveau mot de passe',
          html: `<h1>Bonjour ${userUpdated.nom} ${userUpdated.prenom}<br/><br/>
        Votre nouveau mot de passe est ${newpassword}. <br/><br/>
        Amicalement.
        `
        })

        res.json({ data: 'ok' });
      });
  } else {
    res.json({ data: 'nok' });
  }

});

/**
 * Modifier mot de passe
 */
router.post('/changepwd/:id', (req, res) => {
  bdd.utilisateur.findOne({ _id: req.params.id, password: Helpers.motDePasse(req.body.password) }, (err, user) => {
    if (user) {
      bdd.utilisateur.update(
        { _id: user._id },
        { $set: { password: Helpers.motDePasse(req.body.newpassword) } },
        {},
        (err, userUpdated) => {
          if (err) {
            res.json({ data: 'nok', err });
          } else {
            res.json({ data: 'ok' });
          }
        }
      );
    } else {
      res.json({ data: 'nok', err: 'Erreur ancien mot de passe' });
    }
  });
})

/**
 * Remise à zéro du mot de passe 
 */
router.post('/passwordDefault/:id', (req, res) => {
  bdd.utilisateur.findOne({ _id: req.params.id}, (err, user) => {
    if (user) {
      bdd.utilisateur.update(
        { _id: user._id },
        { $set: { password: Helpers.motDePasse("password") } },
        {},
        (err, userUpdated) => {
          if (err) {
            res.json({ data: 'nok', err });
          } else {
            res.json({ data: 'ok' });
          }
        }
      );
    } else {
      res.json({ data: 'nok', err: 'Erreur ancien mot de passe' });
    }
  });
})





/**
 * Ajouter des points BN à un utilisateur
 */
router.post('/offrir/:id', (req, res) => {

  const id = req.params.id;
  const pointOffert = req.body.pointOffert;
  const commentaires = req.body.commentaires;
  const barman = req.user;

  offrir(id, barman, pointOffert, commentaires).then(userFind => {
    console.log(`Ajout de ${pointOffert} à ${userFind.nom + " " + userFind.prenom}`);
    res.json({ data: 'ok' });
  });
});


/**
 * Recherche de plusieurs utilisateurs
 */
router.post('/', (req, res) => {
  let page = parseInt(req.body.page) || 1;
  let nombre = req.body.nombre || 10;
  const isDesactive = req.body.isDesactive;
  const recherche = req.body.recherche;

  let param = {};
  if (typeof isDesactive !== 'undefined') {
    param.isDesactive = isDesactive;
  }

  if (recherche) {
    param.$or = [];
    param.$or.push({ nom: { $regex: new RegExp(`.*${recherche}.*`, 'i') } });
    param.$or.push({ prenom: { $regex: new RegExp(`.*${recherche}.*`, 'i') } });
    param.$or.push({ "profils.nom": { $regex: new RegExp(`.*${recherche}.*`, 'i') } });

  }

  bdd.utilisateur.count(param, function (err, count) {

    const pageMax = Math.ceil(count / nombre);
    if (page > pageMax) {
      page = pageMax;
    }

    
    try {
      nombre = parseInt(nombre);
    } catch(err) {
      nombre = count;
    }


    bdd.utilisateur.find(param).sort({ nom: 1 }).skip((page - 1) * nombre).limit(nombre).exec(function (err, docs) {
      res.json({ page, nombre, total: count, documents: docs });
    });
  });
})


/**
 * Retourne tous les droits disponibles
 */
router.post('/droits', (req, res) => {
  res.json({ droits });
});

/**
 * Retourne tous les profils disponibles
 */
router.post('/profils', (req, res) => {
  res.json({ profils });
});




module.exports = router;