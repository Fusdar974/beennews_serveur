'use strict';

const bdd = require('../bdd');

const offrir = (id, barman, pointOffert, commentaires) => {

  return new Promise(resolve => {
    bdd.utilisateur.findOne({ _id: id }, (err, userFind) => {
      let newCompte = parseInt(userFind.compte) + parseInt(pointOffert);
      bdd.utilisateur.update({ _id: id }, { $set: { compte: newCompte } }, {}, (err, docUpdate) => {
        bdd.historique.insert({
          barman,
          client: userFind._id,
          type: 'SOUM',
          date: new Date(),
          ancienSolde: userFind.compte,
          nouveauSolde: newCompte,
          nouveauCredit: pointOffert,
          paiementCompte: 0,
          paiementEspece: 0,
          paiementCheque: 0,
          paiementVirement: 0,
          rendreMonnaie: 0,
          commentaires
        }, (err, docInsert) => {
          resolve(userFind);
        })
      });
    });
  });
}


module.exports = { offrir };