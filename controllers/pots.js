'use strict';

const express = require('express');
const router = express.Router();
const bdd = require('../bdd');
const Mail = require('../helpers/envoyerMail');

router.post('/produits', (req, res) => {

  bdd.typeproduit.find({ proposablePot: true }, function (err, typeproduits) {

    const typeproduitsTab = [];
    typeproduits.forEach(item => typeproduitsTab[item._id] = item);

    bdd.produit.find({ type: { $in: typeproduits.map(item => item._id) } }).sort({ nom: 1 }).exec(function (err, docs) {
      res.json({
        produits: docs.map(item => {
          item.type = typeproduitsTab[item.type];
          return item;
        })
      });
    });
  });
});

/**
 * Récupération d'un pot
 */
router.get('/:id', (req, res) => {
  bdd.pots.findOne({ _id: req.params.id }, function (err, doc) {
    res.json({ pot: doc });
  });
});

/**
 * Création d'un pot
 */
router.post('/create', (req, res) => {
  let pot = req.body.pot;
  pot.etat = 'Créé';
  bdd.pots.insert(pot, function (err, doc) {
    res.json({ pot: doc });
  });
});

/**
 * Mise à jour d'un pot
 */
router.put('/:id', (req, res) => {

  bdd.pots.findOne({ _id: req.params.id }, (err, potFind) => {
    bdd.pots.update({ _id: req.params.id }, { $set: req.body.pot }, {}, function (err, doc) {
      const tabPromiseProduit = [];

      // Si le pot passe de l'état créé à paiement alors on décompte les produits du stocks
      if (potFind.etat === 'Créé' && req.body.pot.etat === 'Paiement') {
        req.body.pot.articles.forEach(item => {
          tabPromiseProduit.push(new Promise(resolve => {
            bdd.produit.findOne({ _id: item._id }, (err, produit) => {
              const newNombre = produit.nombre - item.quantite;
              console.log(produit.nom + ' ' + produit.nombre + ' ' + item.quantite + ' ' + newNombre);
              bdd.produit.update({ _id: item._id }, { $set: { nombre: newNombre, effacable: false } }, {}, (err, result) => {
                resolve();
              })
            });
          }));
        });

        const regExpMail = /^[0-9a-z._-]+@{1}[0-9a-z.-]{2,}[.]{1}[a-z]{2,5}$/i;
        req.body.pot.participants.forEach(item => {
          tabPromiseProduit.push(new Promise(resolve => {
            bdd.utilisateur.findOne({ _id: item._id }, (err, client) => {
              if (client.mail.match(regExpMail) !== null) {

                const datePotString = new Date(req.body.pot.date).toLocaleDateString().split('-').reverse().map(i => i.toString().padStart(2, '0')).join('/');
                Mail.envoyerMail({
                  from: 'SOUM',
                  to: client.mail,
                  subject: `Règlement pot : ${req.body.pot.titre}`,
                  html: `<h1>Bonjour ${client.nom} ${client.prenom},<br/><br/>
                        Le montant a réglé pour le pot du ${datePotString} est de ${parseFloat(item.renduMonnaie) * -1} €. <br/><br/>
                        Amicalement.
                        `
                });
              }
              bdd.utilisateur.update({ _id: item._id }, { $set: { supprimable: false } }, {}, (err, client) => {
                resolve();
              });
            })
          }));
        })
      }

      Promise.all(tabPromiseProduit).then(() => {
        if (req.body.pot.etat !== 'Créé') {
          const tabPromise = [];
          req.body.pot.participants.forEach(item => {
            tabPromise.push(new Promise(resolve => {
              bdd.utilisateur.findOne({ _id: item._id }, (err, client) => {

                bdd.historique.update({
                  type: 'POT',
                  idPot: req.params.id,
                  client: client._id,
                },
                  {
                    barman: req.user,
                    client: client._id,
                    type: 'POT',
                    nom: req.body.pot.titre,
                    idPot: req.params.id,
                    date: new Date(req.body.pot.date),
                    dateEncaissement: new Date(req.body.pot.dateEncaissement),
                    datePaiement: typeof item.datePaiement === "undefined" ? null : new Date(item.datePaiement),
                    paiementEspece: item.paiementEspece,
                    paiementCheque: item.paiementCheque,
                    paiementVirement: item.paiementVirement,
                    rendreMonnaie: item.renduMonnaie
                  },
                  {
                    upsert: true,
                    returnUpdatedDocs: true
                  },
                  err => {
                    /* Enregistrement de l'historique détail */
                    resolve();
                  });
              });
            }));
          })

          Promise.all(tabPromise).then(() => {
            res.json({ pot: doc });
          })

        } else {
          res.json({ pot: doc });
        }
      });
    })
  });
})

/**
 * Suppression d'un pot
 */
router.delete('/:id', (req, res) => {
  bdd.pots.remove({ _id: req.params.id }, function (err, doc) {
    res.json({ pot: doc });
  });
})

/**
 * Recheche des pots pour l'affichage dans le datatable.
 */
router.post('/', (req, res) => {
  const page = parseInt(req.body.page) || 1;
  const nombre = req.body.nombre || 10;

  bdd.pots.count({}, function (err, count) {
    bdd.pots.find({}).sort({ date: -1 }).skip((page - 1) * nombre).limit(nombre).exec(function (err, docs) {
      res.json({ page, nombre, total: count, documents: docs });
    });
  });
})


module.exports = router;