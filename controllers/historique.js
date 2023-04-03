var express = require('express');
var router = express.Router();
var bdd = require('../bdd');

/**
 * Récupération d'un historique
 */
router.get('/:id', (req, res) => {
  bdd.historique.findOne({ _id: req.params.id }, function (err, doc) {

    if (doc.type === "SOUM") {
      bdd.historiquedetail.find({ historique: doc._id }, (err, histoDetail) => {
        doc.historique = histoDetail;

        console.log('Détail ', doc.historique.length, histoDetail);
        res.json({ doc });
      })
    } else if (doc.type === "POT") {
      bdd.pots.findOne({ _id: doc.idPot }, (err, infoPot) => {

        console.log(infoPot.participants)
        doc.historique = infoPot.articles;
        doc.participants = infoPot.participants.map(item => ({
          nom: item.nom,
          prenom: item.prenom
        }));
        res.json({ doc });
      })
    }


  });
})

module.exports = router;