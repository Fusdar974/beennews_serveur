'use strict';

const express = require('express');
const router = express.Router();
const bdd = require('../bdd');

/**
 * Obtenir la liste de tous les torréfacteurs.
 */
router.post('/torrefacteurs', (req, res) => {
  bdd.utilisateur.find({
    $or: [
      { "profils": { $elemMatch: { nom: 'Torréfacteur' } } },
      { "profils": { $elemMatch: { nom: 'Torréfacteur Admin' } } }
    ]

  }).sort({ nom: 1 }).exec((err, docs) => {
    res.json({
      documents: docs.map(item => ({
        _id: item._id, nom: item.nom, prenom: item.prenom, surnom: item.surnom, desactive: item.isDesactive
      }))
    });
  });
});

/**
 * Enregistrement d'un versement.
 */
router.post('/versement', (req, res) => {
  const versement = req.body.versement;
  versement.date = new Date(versement.date);
  bdd.cafeversement.insert(versement).then(doc => {
    res.json({ documents: doc });
  });
});

/**
 * Obtenir les consommations d'un café.
 */
router.get('/conso/:idCafe', (req, res) => {
  bdd.cafe.findOne({ _id: req.params.idCafe }).exec().then(cafe => {
    bdd.cafeconso.find({ cafe: req.params.idCafe }).then(documents => {
      res.json({ documents, cafe });
    })
  });
});

/**
 * Enregistrement des consommations d'un café.
 */
router.post('/conso/:idCafe', (req, res) => {
  bdd.cafe.update(
    { _id: req.params.idCafe },
    {
      $set: {
        consomme: req.body.total > 0,
        commentaire: req.body.commentaire,
        total: req.body.total,
        acheteur: req.body.acheteur,
        prix: parseFloat(req.body.prix.toString().replace(',', '.')),
        poids: parseInt(req.body.poids),
        nom: req.body.nom,
        note: req.body.note
      }
    },
    { returnUpdatedDocs: false }
  ).then(numUser => {

    const tabPromise = [];

    req.body.consos.forEach(item => {
      if (item.nombre === 0) {
        tabPromise.push(bdd.cafeconso.remove({ torrefacteur: item.torrefacteur, cafe: item.cafe }));
      } else {
        item.dateSaisie = new Date(req.body.dateSaisie);
        tabPromise.push(bdd.cafeconso.update({ torrefacteur: item.torrefacteur, cafe: item.cafe }, { $set: item }, { upsert: true }));
      }
    });

    //tabPromise.push(bdd.cafe.update({ nom: req.body.nom }, { $set: { note: req.body.note } }, { multi: true }));

    Promise.all(tabPromise).then(() => {
      res.json({ data: 'ok' });
    })
  })
});

/**
 * Obtenir la valeur d'un compte. 
 */
router.get('/compte/:id', (req, res) => {
  const identifiant = req.params.id;
  bdd.cafe.find({ acheteur: identifiant }).then(cafeAchete => {
    bdd.cafeconso.find({ torrefacteur: identifiant }).then(cafeConsomme => {
      bdd.cafeversement.find({ torrefacteur: identifiant }).then(cafeVersement => {
        const credit = cafeAchete.reduce((a, b) => a + b.prix, 0);
        const debit = cafeConsomme.reduce((a, b) => a + b.prix, 0);
        const nbCafe = cafeConsomme.reduce((a, b) => a + b.nombre, 0);
        const versement = cafeVersement.reduce((a, b) => a + b.valeur, 0);
        res.json({ total: credit - debit + versement, nbCafe });
      });
    });
  });
});

/**
 * Obtenir l'historique d'un torréfacteur.
 */
router.get('/historique/:idTorrefacteur', (req, res) => {
  const identifiant = req.params.idTorrefacteur;

  const annee = parseInt(req.query.annee);
  const mois = parseInt(req.query.mois);
  const dateDebut = new Date(annee, mois, 1,0,0,0,0);
  const dateFin = new Date(annee, mois + 1, 0,23,59,59,999);

  const tabProm = [];

  tabProm.push(bdd.cafe.find({
    acheteur: identifiant,
    $and: [
      { "dateAchat": { $gt: dateDebut } },
      { "dateAchat": { $lt: dateFin } },
    ]
  }).then(cafeAchete => {
    return cafeAchete.map(item => ({ type: 'achat', date: item.dateAchat, valeur: item.prix, commentaire: `Achat du café: ${item.nom}, poids ${item.poids >= 1000 ? (item.poids / 1000) + ' kg' : item.poids + ' g'} , cafés consommés: ${item.total}` }));
  }));

  tabProm.push(bdd.cafeconso.find({
    torrefacteur: identifiant,
    $and: [
      { "dateSaisie": { $gt: dateDebut } },
      { "dateSaisie": { $lt: dateFin } },
    ]
  }).then(cafeConsomme => {
    return cafeConsomme.map(item => ({ type: 'conso', date: item.dateSaisie, valeur: -item.prix, commentaire: `Consommation de ${item.nombre} café(s)` }));
  }));

  tabProm.push(bdd.cafeversement.find({
    torrefacteur: identifiant,
    $and: [
      { "date": { $gt: dateDebut } },
      { "date": { $lt: dateFin } },
    ]
  }).then(cafeVersement => {
    return cafeVersement.map(item => ({ type: 'versement', date: item.date, valeur: item.valeur, commentaire: item.commentaire }));
  }));

  Promise.all(tabProm).then(resultProm => {
    const result = resultProm.reduce((acc, result) => acc.concat(result), [])
    result.sort((a, b) => b.date.getTime() - a.date.getTime());
    res.json({
      documents: result
    });
  });
})

/**
 * Obtenir les consommation d'un torréfacteur pour une année.
 */
router.get('/stat/conso/:annee', (req, res) => {

  const annee = parseInt(req.params.annee);
  const tab = [];
  for (let mois = 0; mois < 12; mois++) {
    const dateDebut = new Date(annee, mois, 1,0,0,0,0);
    const dateFin = new Date(annee, mois + 1, 0,23,59,59,999);
    tab.push(
      bdd.cafeconso.find({
        $and: [
          { "dateSaisie": { $gt: dateDebut } },
          { "dateSaisie": { $lt: dateFin } },
        ]
      }).groupBy("torrefacteur")
        .aggregates({ "count": ["sum", "nombre"], "total": ["sum", "prix"] })
        .then(result => {
          return { mois, annee, result }
        })
    );
  }
  Promise.all(tab).then(result => {
    res.json({ documents: result });
  })
})

/**
 * Obtenir les statistiques (min, max, moy) par poids des paquets de cafés.
 */
router.get('/stat/paquet', (req, res) => {
  bdd.cafe.find({
    total: { $ne: 0 }
  }).groupBy("poids")
    .aggregates({
      "avg": ["avg", "total"],
      "max": ["max", "total"],
      "min": ["min", "total"]
    })
    .then(result => {


      res.json({ documents: result });
    });
})

/**
 * Obtenir les statistiques d'achat des paquets de cafés pour une année.
 */
router.get('/stat/achat/:annee', (req, res) => {
  const annee = parseInt(req.params.annee);
  const tab = [];
  for (let mois = 0; mois < 12; mois++) {
    const dateDebut = new Date(annee, mois, 1,0,0,0,0);
    const dateFin = new Date(annee, mois + 1, 0,23,59,59,999);
    tab.push(
      bdd.cafe.find({
        $and: [
          { "dateAchat": { $gt: dateDebut } },
          { "dateAchat": { $lt: dateFin } },
        ]
      }).groupBy("acheteur")
        .aggregates({ "count": ["sum", "prix"] })
        .then(result => {
          return { mois, annee, result }
        })
    );
  }
  Promise.all(tab).then(result => {
    res.json({ documents: result });
  })
})

/**
 * Obtenir la liste des cafés.
 */
router.post('/list', (req, res) => {

  let page = parseInt(req.body.page) || 1;
  let nombre = req.body.nombre || 10;
  let param = {};
  bdd.cafe.count(param).then(count => {
    const pageMax = Math.ceil(count / nombre);
    if (page > pageMax) {
      page = pageMax;
    }

    try {
      nombre = parseInt(nombre);
    } catch (err) {
      nombre = count;
    }

    let sort = {};
    if (typeof req.body.filtre === "undefined") {
      sort = { consomme: 1, dateAchat: -1 }
    } else {
      sort[req.body.filtre] = req.body.ordre;
    }

    bdd.cafe.find(param).sort(sort).skip((page - 1) * nombre).limit(nombre).exec().then(docs => {
      res.json({ page, nombre, total: count, documents: docs });
    });
  });
});

/**
 * Suppression d'un café.
 */
router.delete('/:id', (req, res) => {
  console.log(`Suppression d'un café ${req.params.id}`);

  bdd.cafe.findOne({ _id: req.params.id }).exec().then(cafeTrouve => {
    if (!cafeTrouve.consomme) {
      bdd.cafe.remove({ _id: cafeTrouve._id }).then(doc => {
        res.json({ data: 'ok' });
      });
    } else {
      res.json({ data: 'nok', erreur: 'Le café est déjà consommé' });
    }
  })

});

/**
 * Ajout d'un café.
 */
router.post('/', (req, res) => {
  console.log('Ajout du café');
  const { nom, poids, prix, nombre, dateAchat, acheteur } = req.body.ajoutCafe;
  const cafes = [];

  for (let i = 0; i < nombre; i++) {
    cafes.push({
      nom,
      poids: parseInt(poids),
      prix: prix / nombre,
      dateAchat: new Date(dateAchat),
      acheteur,
      total: 0,
      commentaire: "",
      consomme: false
    })
  }
  bdd.cafe.insert(cafes).then(doc => {
    res.json({ documents: doc });
  });
});

module.exports = router;
