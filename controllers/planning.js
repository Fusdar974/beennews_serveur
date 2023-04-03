'use strict';

const express = require('express');
const router = express.Router();
const bdd = require('../bdd');


router.get('/barmanJour', (req, res) => {

  const auj = new Date();
  const jour = auj.getDate().toString().padStart(2, '0');
  const mois = (auj.getMonth() + 1).toString().padStart(2, '0');
  const annee = auj.getFullYear().toString();

  bdd.planning.findOne({ jour, mois, annee }, (err, doc) => {
    if (doc) {
      res.json({ data: doc });
    } else {
      res.json({ data: 'personne' });
    }

  });
})


router.get('/barmans', (req, res) => {
  bdd.utilisateur.find({ isDesactive: false, profils: { $elemMatch: { nom: 'Barman' } } }).sort({ nom: 1 }).exec((err, barmans) => {
    res.json({ barmans })
  });
});

/**
 * Récupération du mois en cours
 */
router.get('/:annee/:mois', (req, res) => {

  let aujServeur = new Date();
  
  const mois = req.params.mois || aujServeur.getMonth();
  const annee = req.params.annee || aujServeur.getFullYear();

  let jour = aujServeur.getDate();
  let jourMax = new Date(annee, parseInt(mois)+1, 0).getDate();
  
  if (jour > jourMax) {
    jour = jourMax;
  }

  
  const calendrier = [];

  let auj = new Date(annee, mois, jour);
  
  const preJour = new Date(auj.getFullYear(), auj.getMonth(), 1, 0, 0, 0);
  const depart = -(auj.getDate() - 2 + (preJour.getDay() === 0 ? 7 : preJour.getDay()));

  
  const derJour = new Date(auj.getFullYear(), auj.getMonth() + 1, 0, 0, 0, 0);
  const fin = derJour.getDate() - auj.getDate() + (7 - (derJour.getDay() === 0 ? 7 : derJour.getDay())) + 1;

  
  const trad = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
  const tradMois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  for (let i = depart; i < fin; i++) {
    const jour = new Date(
      auj.getFullYear(),
      auj.getMonth(),
      auj.getDate() + i
    );

    calendrier.push({
      jour: jour.getDate().toString().padStart(2, '0'),
      mois: (jour.getMonth() + 1).toString().padStart(2, '0'),
      annee: jour.getFullYear().toString(),
      libelleJour: trad[jour.getDay()],
      weekEnd: jour.getDay() === 6 || jour.getDay() === 0,
      auj: jour.getDate() === aujServeur.getDate() && aujServeur.getMonth() === jour.getMonth() && parseInt(mois) === aujServeur.getMonth() && parseInt(annee) === aujServeur.getFullYear(),
      moisEnCours: auj.getMonth() === jour.getMonth()
    })
  }

  const tab = [];
  calendrier.forEach(item => {
    tab.push(new Promise(resolve => {
      bdd.planning.findOne({ jour: item.jour, mois: item.mois, annee: item.annee }, (err, doc) => {
        if (doc) {
          item.barman = doc.barman;
          item.barmanRecompense = doc.barmanRecompense;
        }
        resolve();
      })
    }))
  });

  const libelleMois = tradMois[mois];

  Promise.all(tab).then(() => {
    res.json({ calendrier, libelleMois })
  });

})

router.post('/', (req, res) => {
  let { planning } = req.body;

  bdd.planning.update(
    { jour: planning.jour, mois: planning.mois, annee: planning.annee },
    { $set: planning },
    { upsert: true },
    function (err, doc) {
      res.json({ planning: doc });
    });
});




module.exports = router;