'use strict';

const bdd = require('../bdd');
const profils = require('../controllers/profils');
const crypto = require('crypto');
const config = require(`../config/${process.env.NODE_ENV}.json`);
const jwt = require('jsonwebtoken');

class Helpers {

  static charger(executer = false) {
    if (executer) {
      console.log('------ Création de la BDD -----')

      const tabSupp = [];

      Object.keys(bdd).forEach(item => {
        tabSupp.push(new Promise(resolve => {
          bdd[item].remove({}, { multi: true }, function (err, removed) {
            console.log(`${item} supprimé ==>`, removed);
            resolve();
          });
        }));
      });

      Promise.all(tabSupp).then(() => {

        console.log('------- Fin suppression -----------');

        const tabCreation = [];


        tabCreation.push(new Promise(resolve => {
          const tabUtilisateur = [];

          const monpassword = this.motDePasse('password');

          tabUtilisateur.push({
            nom: `aimé`,
            prenom: `david`,
            password: monpassword,
            mail: 'david.aime@intradef.gouv.fr',
            profils,
            compte: 0,
            supprimable: false,
            isDesactive: false
          })

          tabUtilisateur.push({
            nom: `rubini`,
            prenom: `steve`,
            password: monpassword,
            mail: 'david.aime@intradef.gouv.fr',
            profils: [profils[1]],
            compte: 0,
            supprimable: false,
            isDesactive: false
          })

          bdd.utilisateur.insert(tabUtilisateur, (err, newDocsUtils) => {
            console.log("Utilisateur inséré ==>", newDocsUtils.length);
            resolve();
          });
        }));

        tabCreation.push(new Promise(resolve => {
          bdd.parametre.update({ nom: 'valeurBN' }, { nom: 'valeurBN', valeur: 0.25 }, { upsert: true }, (err, result) => {
            console.log('Creation param valeur BN ==>', result);
            resolve();
          });
        }))

        tabCreation.push(new Promise(resolve => {
          let tabProduit = [];
          const tabTypeProduit = [
            {
              nom: "Boissons",
              proposablePot: true,
              proposableSoum: true,
              proposableFrigo: true,
            }, {
              nom: "Glaces",
              proposablePot: false,
              proposableSoum: true,
              proposableFrigo: true,
            }, {
              nom: "Friandises",
              proposablePot: false,
              proposableSoum: true,
              proposableFrigo: false,
            }, {
              nom: "Cartes",
              proposablePot: false,
              proposableSoum: true,
              proposableFrigo: false,
            }, {
              nom: "PDJ",
              proposablePot: false,
              proposableSoum: true,
              proposableFrigo: false,
            }, {
              nom: "Bières",
              proposablePot: true,
              proposableSoum: false,
              proposableFrigo: true,
            },
          ];


          bdd.typeproduit.insert(tabTypeProduit, (err, newDocs) => {
            console.log("TypeProduit inséré ==>", newDocs.length);

            tabProduit = tabProduit.concat([
              // Boissons
              {
                nom: `7 UP`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/7up.png'
              },
              {
                nom: `Coca cola`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/coca.png'
              },
              {
                nom: `Coca Cola Cherry`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/cocaColaCherry.png'
              },
              {
                nom: `Coca Cola Zéro`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/cocaColaZero.png'
              },
              {
                nom: `Fanta`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/Fanta.png'
              },
              {
                nom: `Infusion Orange Mangue`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/InfusionOrangeMangue.png'
              },
              {
                nom: `Liptonic`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/liptonic.png'
              },
              {
                nom: `Litonic Ice Tea`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/liptonIceTea.png'
              },
              {
                nom: `Maytea Menthe`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/mayteaMenthe.png'
              },
              {
                nom: `Maytea Peche`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/mayteaPeche.png'
              },
              {
                nom: `Oasis`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/oasis.png'
              },
              {
                nom: `Orangina`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/orangina.png'
              },
              {
                nom: `Pepsi`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/pepsi.png'
              },
              {
                nom: `Pepsi Max`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/pepsiMax.png'
              },
              {
                nom: `Perrier`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/perrier.png'
              },
              {
                nom: `Perrier Citron`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/perrierCitron.png'
              },
              {
                nom: `Perrier Citron Vert`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/perrierCitronVert.png'
              },
              {
                nom: `Perrier Juice Ananas Mangue`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/perrierJuiceAnanasMangue.png'
              },
              {
                nom: `Schweppes Agrumes`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/schweppesAgrumes.png'
              },
              {
                nom: `Schweppes Agrumes Zero`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/schweppesAgrumesZero.png'
              },
              {
                nom: `Schweppes Tonic`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/schweppesTonic.png'
              },
              {
                nom: `Tropico`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/tropico.png'
              },

              {
                nom: `Arizona Green Tea`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/arizonaGreenTea.png'
              },
              {
                nom: `Arizona Iced Tea`,
                prix: 6, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/arizonaIcedTea.png'
              },
              {
                nom: `Arizona Pommergranate`,
                prix: 6, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/arizonaPommergranate.png'
              },
              {
                nom: `Arizona Punch`,
                prix: 6, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/arizonaPunch.png'
              },
              {
                nom: `Monster`,
                prix: 6, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[0]._id,
                image: 'image/monster.png'
              },
              {
                nom: `Jus de fruit citron`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pageCitron.png'
              },
              {
                nom: `Jus de fruit pamplemousse`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pagePamplemousse.png'
              },
              {
                nom: `Jus de fruit abricot`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pagoAbricot.png'
              },
              {
                nom: `Jus de fruit ananas`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pagoAnanas.png'
              },
              {
                nom: `Jus de fruit banane`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pagoBanane.png'
              },
              {
                nom: `Jus de fruit fraise`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pagoFraise.png'
              },
              {
                nom: `Jus de fruit mangue`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pagoMangue.png'
              },
              {
                nom: `Jus de fruit orange`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pagoOrange.png'
              },
              {
                nom: `Jus de fruit pêche`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pagoPeche.png'
              },
              {
                nom: `Jus de fruit poire`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pagoPoire.png'
              },
              {
                nom: `Jus de fruit tomate`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pagoTomate.png'
              },
              {
                nom: `Jus de fruit tropical`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[0]._id,
                image: 'image/pagoTropical.png'
              },

              // GLaces
              {
                nom: `Cone chocolat`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[1]._id,
                image: 'image/coneChocolat.png'
              },
              {
                nom: `Magnum amande`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[1]._id,
                image: 'image/magnumAmande.png'
              },
              {
                nom: `Magnum blanc`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[1]._id,
                image: 'image/magnumBlanc.png'
              },
              {
                nom: `Magnum classique`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[1]._id,
                image: 'image/magnumClassique.png'
              },
              {
                nom: `Bounty Glacé`,
                prix: 6, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[1]._id,
                image: 'image/bountyGlace.png'
              },
              {
                nom: `Mars Glacé`,
                prix: 6, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[1]._id,
                image: 'image/marsGlace.png'
              },
              {
                nom: `Mister Freeze`,
                prix: 6, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[1]._id,
                image: 'image/misterFreeze.png'
              },
              {
                nom: `Snickers Glacé`,
                prix: 6, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[1]._id,
                image: 'image/snickersGlace.png'
              },
              {
                nom: `Sorbet Oasis Peche Framboise`,
                prix: 6, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[1]._id,
                image: 'image/sorbetOasisPecheFrambois.png'
              },
              {
                nom: `Sorbet Oasis Tropical`,
                prix: 6, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[1]._id,
                image: 'image/sorbetOasisTropical.png'
              },

              // Friandises
              {
                nom: `Balisto`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/balisto.png'
              },
              {
                nom: `Bonbon`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/bonbon.png'
              },
              {
                nom: `Bounty`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/bounty.png'
              },
              {
                nom: `Crunch`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/crunch.png'
              },
              {
                nom: `Kinder bueno`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/kinderBueno.png'
              },
              {
                nom: `Kitkat`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/kitkat.png'
              },
              {
                nom: `Lion`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/lion.png'
              },
              {
                nom: `M&Ms Bleu`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/mmsbleu.png'
              },
              {
                nom: `M&Ms Jaune`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/mmsjaune.png'
              },
              {
                nom: `M&Ms Noir`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/mmsnoir.png'
              },
              {
                nom: `Maltesers`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/maltesers.png'
              },
              {
                nom: `Mars`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/mars.png'
              },
              {
                nom: `Oréo`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/oreo.png'
              },
              {
                nom: `Snickers`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/snickers.png'
              },
              {
                nom: `Sundy`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/sundy.png'
              },
              {
                nom: `Toblerone`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/toblerone.png'
              },
              {
                nom: `Twix`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/twix.png'
              },
              {
                nom: `Twix White`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/twixWhite.png'
              },
              {
                nom: `Tic Tac Citron/orange`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/ticTacCitronOrange.png'
              },
              {
                nom: `Tic Tac Menthe`,
                prix: 4, prixEuros: 0, credit: 0, effacable: true,
                nombre: 10,
                type: newDocs[2]._id,
                image: 'image/ticTacMenthe.png'
              },
              // Carte
              {
                nom: `Carte 10€`,
                prix: 0, prixEuros: 10, credit: 42, effacable: true,
                nombre: 10,
                type: newDocs[3]._id,
                image: 'image/NoLogo.png'
              },

              // Petit Déjeuner
              {
                nom: `Croissant + Jus`,
                prix: 2, prixEuros: 0, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[4]._id,
                image: 'image/croissant jusorange.png'
              },

              // Bières
              {
                nom: `Goudale`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/goudale.png'
              },
              {
                nom: `Bière 1664`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/1664.png'
              },
              {
                nom: `Chimay bleue`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/chimayBleue.png'
              },
              {
                nom: `Chimay rouge`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/chimayRouge.png'
              },
              {
                nom: `Corona`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/corona.png'
              },
              {
                nom: `Desperados`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/desperados.png'
              },
              {
                nom: `Desperados red`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/desperadosRed.png'
              },
              {
                nom: `Duff`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/duff.png'
              },
              {
                nom: `Duvel`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/duvel.png'
              },
              {
                nom: `Grimbergen blonde`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/grimbergen.png'
              },
              {
                nom: `Grimbergen double`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/grimbergenDouble.png'
              },
              {
                nom: `Grimbergen rouge`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/grimbergenRouge.png'
              },
              {
                nom: `Hoogarden`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/hoogardenjpg.png'
              },
              {
                nom: `La Trappe quadrupel`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/latrappeQuadrupel.png'
              },
              {
                nom: `La trappe triple`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/latrappeTripel.png'
              },
              {
                nom: `Leffe blonde`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/leffeBlonde.png'
              },
              {
                nom: `Leffe brune`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/leffeBrune.png'
              },
              {
                nom: `Leffe radieuse`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/leffeRadieuse.png'
              },
              {
                nom: `Leffe rituel`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/leffeRituel.png'
              },
              {
                nom: `Leffe triple`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/leffeTriple.png'
              },
              {
                nom: `Linderman kriek`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/lindermanKriek.png'
              },
              {
                nom: `Linderman pêcheresse`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/pecheresse.png'
              },
              {
                nom: `Pelforth blonde`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/pelforthBlonde.png'
              },
              {
                nom: `Pelforth brune`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/pelforthBrune.png'
              },
              {
                nom: `Rochefort 6`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/rochefort6.png'
              },
              {
                nom: `Rochefort 8`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/rochefort8.png'
              },
              {
                nom: `Rochefort 10`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/rochefort10.png'
              },
              {
                nom: `Skoll`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/skoll.png'
              },
              {
                nom: `Heineken`,
                prix: 0, prixEuros: 1.5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/heineken.png'
              },
              {
                nom: `Apéritifs gâteaux`,
                prix: 0, prixEuros: 5, credit: 0, effacable: true,
                nombre: 50,
                type: newDocs[5]._id,
                image: 'image/chips_aperitif.png'
              },
            ]);

            bdd.produit.insert(tabProduit.map(item => {
              item.archive = false;
              return item;
            }), (err, newDocsProduit) => {
              console.log("Produit inséré ==>", newDocsProduit.length);
              resolve();
            });
          });
        }));

        Promise.all(tabCreation).then(() => {
          console.log('--------- Fin création ------------');
        });

      });
    }
  }

  static motDePasse(password) {
    return crypto.pbkdf2Sync(password, "saltsuprise", 100, 64, 'sha512').toString('hex');
  }

  static genererNouveauMotDePasse() {
    let i = 15;
    let newpassword = "";
    while (i--) {
      newpassword = `${newpassword}${String.fromCharCode(parseInt(Math.random() * 26 + 97))}`
    }

    return newpassword;
  }

  static obtenirTicket(nom, prenom, donnees = []) {
    const ticket = jwt.sign(
      {
        'PDF': 'PDF',
        nom,
        prenom,
        donnees
      },
      'NOUVELLE_CHAINE_SECRETE_DE_MALADE',
      { expiresIn: '2s' }
    )
    return ticket;
  }
}

module.exports = Helpers;