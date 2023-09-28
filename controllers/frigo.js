'use strict';

const express = require('express');
const router = express.Router();
const bdd = require('../bdd');
const Helpers = require('../helpers/helpers');
const { offrir } = require('./metier');

router.post('/', (req, res) => {

  bdd.frigo.find({}, function (err, itemsInFrigo) {
    bdd.produit.find({ _id: { $in: itemsInFrigo.map(item => item._id) } }, function (err, docs) {
      res.json({
        produits: docs.map(item => {
          return item;
        })
      });
    });
  });
});

router.post('/possibleItems', (req, res) => {

  bdd.typeproduit.find({ proposableFrigo: true }, function (err, typeproduits) {

    const typeproduitsTab = [];
    typeproduits.forEach(item => typeproduitsTab[item._id] = item);

    bdd.produit.find({ type: { $in: typeproduits.map(item => item._id) }, archive: false  }, function (err, docs) {
      res.json({
        produits: docs.map(item => {
          item.type = typeproduitsTab[item.type];
          return item;
        })
      });
    });
  });
});
router.post('/possibleItems', (req, res) => {

  bdd.typeproduit.find({ proposableFrigo: true }, function (err, typeproduits) {

    const typeproduitsTab = [];
    typeproduits.forEach(item => typeproduitsTab[item._id] = item);

    bdd.produit.find({ type: { $in: typeproduits.map(item => item._id) }, archive: false  }, function (err, docs) {
      res.json({
        produits: docs.map(item => {
          item.type = typeproduitsTab[item.type];
          return item;
        })
      });
    });
  });
});



module.exports = router;