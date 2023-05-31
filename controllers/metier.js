'use strict';

const bdd = require('../bdd');

/**
 * offre des BN à un utilisateur et enregistre l'opération dans l'historique
 * @param id l'identifiant de l'utilisateur
 * @param barman le barman qui a effectuer la transaction
 * @param pointOffert le nombre de points offerts
 * @param commentaires les commentaires du barman
 * @returns {Promise<unknown>}
 */
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

/**
 * Recharge les BN d'un utilisateur dans la BDD et enregistre l'opération dans l'historique
 * @param id l'identifiant de l'utilisateur
 * @param paiementEspece la somme donnée en espèces
 * @param paiementVirement la somme donnée par virement
 * @param pointRecharge le nombre de points à recharger
 * @param barman le barman qui a effectuer la transaction
 * @returns {Promise<unknown>}
 */
const recharger = (id, paiementEspece, paiementVirement, pointRecharge, barman) => {

  return new Promise(resolve => {
    bdd.utilisateur.findOne({ _id: id }, (err, userFind) => {
      let newCompte = parseInt(userFind.compte) + parseInt(pointRecharge);
      bdd.utilisateur.update({ _id: id }, { $set: { compte: newCompte } }, {}, (err, docUpdate) => {
        bdd.historique.insert({
          barman,
          client: userFind._id,
          type: 'SOUM',
          date: new Date(),
          ancienSolde: userFind.compte,
          nouveauSolde: newCompte,
          nouveauCredit: pointRecharge,
          paiementCompte: 0,
          paiementEspece: paiementEspece,
          paiementCheque: 0,
          paiementVirement: paiementVirement,
          rendreMonnaie: 0,
        }, (err, docInsert) => {
          resolve(userFind);
        })
      });
    });
  });
}


module.exports = { offrir, recharger };