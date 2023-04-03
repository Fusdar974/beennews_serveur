'use strict';

const express = require('express');
const router = express.Router();
const bdd = require('../bdd');
const Helpers = require('../helpers/helpers');


router.post('/consoSoum', (req, res) => {
  const ticket = Helpers.obtenirTicket(req.user.nom, req.user.prenom, {debut:req.body.debut, fin:req.body.fin} );
  return res.json({ ticket });
});

/**
 * Spécifie une valeur pour un attribut passé en params.
 */
router.post('/:id', (req, res) => {
  const obj = {
    nom: req.params.id,
    valeur: req.body.valeur
  };

  bdd.parametre.update({ nom: req.params.id }, obj, { upsert: true }, (err, resBDD) => {
    res.json({ data: 'ok' });
  });
});

/**
 * Retour la valeur en paramètre, si la valeur n'existe pas cela retourne 0.
 */
router.get('/:id', (req, res) => {
  bdd.parametre.findOne({ nom: req.params.id }, (err, resBDD) => {
    if (err || resBDD === null) {
      const obj = {
        nom: req.params.id,
        valeur: '0'
      };
      res.json(obj);
    } else {
      res.json(resBDD);
    }
  });
    
});


module.exports = router;