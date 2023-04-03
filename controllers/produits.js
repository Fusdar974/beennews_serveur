const express = require('express');
const router = express.Router();
const bdd = require('../bdd');
const fs = require('fs');
const Helpers = require('../helpers/helpers');

/**
 * Retourne un produit par son id.
 */
router.get('/:id', (req, res) => {
  bdd.produit.findOne({ _id: req.params.id }, function (err, doc) {
    res.json({ produit: doc });
  });
})

/**
 * Génére une chaine de caractère sous le format : YYYY_MM_DD_HH_mm_ss_mmm.
 */
function timestamp() {
  function pad(n) { return n < 10 ? "0" + n : n };
  d = new Date();
  separateur = '_';

  return d.getFullYear() + separateur +
    pad(d.getMonth() + 1) + separateur +
    pad(d.getDate()) + separateur +
    pad(d.getHours()) + separateur +
    pad(d.getMinutes()) + separateur +
    pad(d.getSeconds()) + separateur +
    d.getMilliseconds().toString().padStart(3, '0');
}

/**
 * Modifie les valeurs d'un produit.
 */
router.put('/:id', (req, res) => {

  const { nom, prix, prixEuros, type, nombre, credit, archive } = req.body.produit;
  produitModif = { nom, prix, prixEuros, nombre, type, credit, archive };

  if (req.body.produit.imageBnr) {
    const image = `image/${timestamp()}`;
    fs.writeFile(image, Buffer.from(req.body.produit.imageBnr, 'latin1'), err => {
      produitModif.image = image;
      bdd.produit.update({ _id: req.params.id }, { $set: produitModif }, {}, function (err, doc) {
        res.json({ produit: doc });
      });

    });
  } else {
    console.log(produitModif);
    bdd.produit.update({ _id: req.params.id }, { $set: produitModif }, {}, function (err, doc) {
      res.json({ produit: doc });
    });
  }
})

/**
 * Créé un produit.
 */
router.post('/create', (req, res) => {

  let image = `image/NoLogo.png`;
  const { nom, type, prix, prixEuros, nombre, credit, archive } = req.body.produit;
  const effacable = true;

  if (req.body.produit.imageBnr) {
    let image = `image/${timestamp()}`;
    fs.writeFile(image, Buffer.from(req.body.produit.imageBnr, 'latin1'), err => {
      console.log("ERREUR", err);

      produitModif = { nom, prix, type, prixEuros, nombre, image, effacable, credit, archive };

    

      bdd.produit.insert(produitModif, function (err, doc) {
        res.json({ produit: doc });
      });
    });

  } else {

    produitModif = { nom, prix, prixEuros, type, nombre, image, effacable,archive };

    bdd.produit.insert(produitModif, function (err, doc) {
      res.json({ produit: doc });
    });
  }
});

/**
 * Suppression d'un produit par son identifiant.
 */
router.delete('/:id', (req, res) => {
  bdd.produit.remove({ _id: req.params.id }, function (err, doc) {
    res.json({ produit: doc });
  });
})

/**
 * Obtention d'un token JWT pour télécharger la liste des produits.
 */
router.post('/pdf', (req, res) => {

  const ticket = Helpers.obtenirTicket(req.user.nom, req.user.prenom, req.body.types);
  return res.json({ ticket });
});

/**
 * Recherche de produit.
 */
router.post('/', (req, res) => {
  let page = parseInt(req.body.page) || 1;
  let nombre = req.body.nombre || 10;
  const recherche = req.body.recherche;

  const param = {};
  if (recherche) {
    param.nom = { $regex: new RegExp(`.*${recherche}.*`, 'i') };
  } else {
    param.nom = { $regex: new RegExp(`.*`, 'i') };
  }

  bdd.typeproduit.find(param).exec(function (err, tprecherche) {

    param.type = { $in: tprecherche.map(item => item._id) };

    const paramOr = {
      $or: [ { nom: param.nom} , {type: param.type}]
    }

    bdd.produit.count(paramOr, function (err, count) {
      const pageMax = Math.ceil(count / nombre);
      if (page > pageMax) {
        page = pageMax;
      }

      try {
        nombre = parseInt(nombre);
      } catch(err) {
        nombre = count;
      }

      bdd.typeproduit.find({}).exec(function (err, typeproduits) {
        bdd.produit.find(paramOr).sort({ nom: 1 }).skip((page - 1) * nombre).limit(nombre).exec(function (err, docs) {
          res.json({
            page, nombre, total: count, documents: docs.map(item => {
              item.type = typeproduits.filter(tp => tp._id === item.type)[0];
              return item;
            })
          });
        });
      });
    });
  });
})



module.exports = router;