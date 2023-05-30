'use strict';

const express = require('express');
const router = express.Router();
const bdd = require('../bdd');
const Helpers = require('../helpers/helpers');
const { offrir } = require('./metier');

router.post('/', (req, res) => {

  bdd.typeproduit.find({ proposableSoum: true }, function (err, typeproduits) {

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


router.post('/panier', (req, res) => {

  const panier = req.body.panier;

  bdd.utilisateur.findOne({ _id: panier.utilisateur._id }, (err, client) => {

    const { paiementCompte, paiementCheque, paiementEspece, paiementVirement, rendreMonnaie } = panier;
    let nouveauSoldeCompte = client.compte - paiementCompte;
    let nouveauCredit = 0;
    const tabPromise = [];

    panier.articles.forEach(item => {
      tabPromise.push(new Promise(resolve => {
        bdd.produit.findOne({ _id: item._id }, (err, produit) => {
          if (produit.credit > 0) {
            nouveauSoldeCompte += produit.credit * item.quantite;
            nouveauCredit += produit.credit * item.quantite;
          }
          const newNombre = produit.nombre - item.quantite;
          bdd.produit.update({ _id: item._id }, { $set: { nombre: newNombre, effacable: false } }, {}, (err, result) => {
            resolve();
          })
        });
      }));
    })

    Promise.all(tabPromise).then(() => {
      bdd.historique.insert({
        barman: req.user,
        client: client._id,
        type: 'SOUM',
        date: new Date(),
        ancienSolde: client.compte,
        nouveauSolde: nouveauSoldeCompte,
        nouveauCredit,
        paiementCompte,
        paiementEspece,
        paiementCheque,
        paiementVirement,
        rendreMonnaie
      }, (err, historique) => {

        const articles = panier.articles.map(item => {
          item.historique = historique._id;
          return item;
        })
        bdd.historiquedetail.insert(articles, (err, histoDetail) => { });
        bdd.utilisateur.update({ _id: client._id }, { $set: { compte: nouveauSoldeCompte, supprimable: false } }, {}, (err, result) => {
          res.json({ data: 'ok' });
        });
      });
    });
  });
});



/**
 * Obtention d'un token JWT pour télécharger le ticket du jour.
 * Attribution d'un point si le barman est prévu sur le planning.
 */
router.post('/ticketjour', (req, res) => {

  const auj = new Date();
  const jour = auj.getDate().toString().padStart(2, '0');
  const mois = (auj.getMonth() + 1).toString().padStart(2, '0');
  const annee = auj.getFullYear().toString();

  bdd.planning.findOne({ jour, mois, annee }, (err, doc) => {

    
    if (doc) {
      if (doc.barman._id === req.user.userId && typeof doc.barmanRecompense === "undefined") {

        doc.barmanRecompense = req.user;
        bdd.planning.update(
          { jour, mois, annee },
          { $set: doc },
          { upsert: true },
          function (err, doc) {
            offrir(req.user.userId, req.user, 1, `Barman le ${jour}/${mois}/${annee}`).then(userFind => {
              console.log(`Ajout de 1 point à ${userFind.nom + " " + userFind.prenom}`);
            });
          });
      } else if (typeof doc.barmanRecompense === "undefined") {
        console.log(`Pas de point attribué à ${req.user.userId} car vous n'etes pas le barman défini`);
      } else {
        console.log(`Point déjà attribué à ${doc.barmanRecompense.nom} ${doc.barmanRecompense.prenom}`);
      }
    } else {
      console.log('Pas de barman de défini');
    }
  });


  const ticket = Helpers.obtenirTicket(req.user.nom, req.user.prenom);
  return res.json({ ticket });
});

module.exports = router;