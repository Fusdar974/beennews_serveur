'use strict';

const express = require('express');
const router = express.Router();
const bdd = require('../bdd');
const Mail = require('../helpers/envoyerMail');
const PDFDocument = require('pdfkit');



const BLEUCLAIR = [184, 191, 231];
const BLEU = [63, 81, 181];
const ORCLAIR = [255, 245, 213];
const OR = [255, 206, 28];


const ajouterImage = (param, x, y) => {
  param.doc.image('./image/abeille.png', param.largeurPage - x, param.hauteurPage - y, { height: 25, width: 25 });
}

const ecrireText = (param, text, y, colonneEC, align) => {
  param.doc.fontSize(10);

  let margeGauche = 0;
  if (align === 'left') {
    margeGauche = 2;
  }
  const centre = 0.5 * (param.hauteurLigne - 10);

  if (param.backgroundColor) {
    param.doc.rect(param.margeX + colonneEC.x, param.margeY + y, colonneEC.largeur, param.hauteurLigne).fill(param.backgroundColor);
  }

  let textColor = 'black';
  if (param.color) {
    textColor = param.color;
  }

  param.doc.fillColor(textColor).text(text, param.margeX + colonneEC.x + margeGauche, param.margeY + y + centre, { width: colonneEC.largeur, align });
  param.doc.lineWidth(0.1).lineJoin('miter').rect(param.margeX + colonneEC.x, param.margeY + y, colonneEC.largeur, param.hauteurLigne).stroke();

}


router.get('/pdf', (req, res) => {

  let parametre = {};
  if (req.user.donnees.length > 0) {
    parametre = { _id: { $in: req.user.donnees } };
  }

  bdd.typeproduit.find(parametre).sort({ nom: 1 }).exec((err, typeproduit) => {

    bdd.produit.find({ type: { $in: typeproduit.map(item => item._id) } }).sort({ nom: 1 }).exec((err, produits) => {

      const tabType = typeproduit.map(item => {
        item.produits = [];
        return item;
      });
      produits.forEach(item => {
        let ligneType = tabType.find(itemType => itemType._id === item.type);
        if (ligneType) {
          ligneType.produits.push(item);
        } else {
          console.log('ERREUR PRODUIT DANS UN TYPE INCONNU')
        }
      });

      const paramPage = { size: 'A4', margin: 10, bufferPages: true };

      const doc = new PDFDocument(paramPage);
      var d = new Date();
      var dS = `${d.getFullYear()}_${(d.getMonth() + 1).toString().padStart(2, '0')}_${(d.getDate()).toString().padStart(2, '0')}`;
      let filename = `stock_${dS}`;
      filename = encodeURIComponent(filename) + '.pdf'
      res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
      res.setHeader('Content-type', 'application/pdf')

      // Parametre d'une feuille A4
      const margeX = 10;
      const margeY = 25;
      const largeurPage = (21 / 2.54 * 72) - margeX * 2;
      const hauteurPage = (29.7 / 2.54 * 72) - margeY * 2;
      const hauteurLigne = 30;
      const param = { doc, margeX, margeY, largeurPage, hauteurPage, hauteurLigne };

      // position curseur
      let x = 0;
      let y = 0;

      // Largeur colonne
      let colonne = [0, 6, 45, 55, 62, 69, 100].map((item, idx, array) => (
        {
          x: largeurPage * item / 100,
          largeur: (array[idx + 1] - item) * largeurPage / 100
        }
      ))


      let text, colonneEC;

      const afficherEntete = () => {
        if (y + hauteurLigne >= hauteurPage) {
          y = 0;
          doc.addPage(paramPage);
        }


        param.backgroundColor = BLEU;
        param.color = 'white';

        ["Image", "Nom", "Prix", "Stock", "Vérif.", "Commentaires"].forEach((item, index) => {
          let colonneEC = colonne[index];
          let text = item;
          ecrireText(param, text, y, colonneEC, "center");
        });
        delete param.backgroundColor;
        param.color = 'black';
        y = y + hauteurLigne;
      };

      let dateJourString = new Date().toLocaleDateString().split('-').reverse().map(item => item.toString().padStart(2, '0')).join('/');
      let heureJourString = new Date().toLocaleTimeString().split(':').map(item => item.toString().padStart(2, '0')).join(':')
      // Affichage libelle du type produits
      doc.fontSize(20);
      text = `Stock du ${dateJourString} à ${heureJourString}`;
      doc.text(text, margeX + x, margeY + y, { width: largeurPage, align: "center" });
      y += 40;


      tabType.forEach(typeProduit => {

        if (y + hauteurLigne >= hauteurPage) {
          y = 0;
          doc.addPage(paramPage);
        }

        y += 10;
        // Affichage libelle du type produits
        doc.fontSize(20);
        text = typeProduit.nom;
        doc.text(text, margeX + x, margeY + y, { width: largeurPage, align: "center" });
        y += hauteurLigne - 5;

        // Affichage de chaque produit du type
        afficherEntete();
        typeProduit.produits.forEach((item, idx) => {

          if (y + hauteurLigne >= hauteurPage) {
            y = 0;
            doc.addPage(paramPage);
            if (idx !== 0) {
              afficherEntete();
            }
          }

          // image
          colonneEC = colonne[0];
          text = '';
          const centreX = 0.5 * (colonneEC.largeur - hauteurLigne);
          doc.image(item.image, margeX + centreX + colonneEC.x, margeY + 1 + y, { fit: [hauteurLigne - 2, hauteurLigne - 2] })
          doc.lineWidth(0.1).lineJoin('miter').rect(margeX + colonneEC.x, margeY + y, colonneEC.largeur, hauteurLigne).stroke();

          // nom
          colonneEC = colonne[1];
          text = item.nom;
          ecrireText(param, text, y, colonneEC, "center");

          // prix
          colonneEC = colonne[2];
          text = item.prix === 0 ? `${item.prixEuros} €` : `${item.prix} BN`;
          ecrireText(param, text, y, colonneEC, "center");

          // stock
          colonneEC = colonne[3];
          text = item.nombre;
          ecrireText(param, text, y, colonneEC, "center");

          // commentaires
          colonneEC = colonne[4];
          text = '';
          ecrireText(param, text, y, colonneEC, "center");

          // commentaires
          colonneEC = colonne[5];
          text = item.archive ? "Archivé" : "";
          ecrireText(param, text, y, colonneEC, "center");

          y += hauteurLigne;

        });
      })

      let pages = doc.bufferedPageRange();
      for (let i = 0; i < pages.count; i++) {
        doc.switchToPage(i);
        ajouterImage(param, 15, -20);

        doc.page.margins.bottom = 0;

        doc
          .text(
            `${i + 1} / ${pages.count}`,
            0,
            hauteurPage + 30,
            { align: 'center' }
          );

      }

      doc.pipe(res);
      doc.end();
    });
  });
})


router.get('/consoSoum', (req, res) => {

  bdd.utilisateur.find({}).exec((errUtil, utilisateurs) => {
    bdd.historique.find({type:'SOUM', $and: [
      { date: { $gt: new Date(req.user.donnees.debut) } },
      { date: { $lt: new Date(req.user.donnees.fin) } }

    ] }).sort({ date: 1 }).exec((err, result) => {
      let retour = [];
    
      let id = 1;

      result.forEach(item => {
        
        let { paiementCompte, paiementEspece, paiementCheque, paiementVirement, rendreMonnaie, date } = item;
        

        if (parseFloat(paiementEspece) > 0) {
          const retourItem = { paiementCompte, paiementEspece, paiementCheque, paiementVirement, rendreMonnaie, date };
          retourItem.client = "";
          retourItem.dateString = 0+";"+date.toLocaleDateString()+";ESPECE";
          retour.push(retourItem);
        }

        if (parseFloat(paiementVirement) > 0) {
          const retourItem = { paiementCompte, paiementEspece, paiementCheque, paiementVirement, rendreMonnaie, date };
          retourItem.client = utilisateurs.filter(itemClient => itemClient._id === item.client)[0];
          retourItem.client = retourItem.client.nom +" "+retourItem.client.prenom;
          retourItem.dateString = id+";"+date.toLocaleDateString()+";VIREMENT";
          id++;
          retour.push(retourItem);
        }
        
        if (parseFloat(paiementCheque) > 0) {

          const retourItem = { paiementCompte, paiementEspece, paiementCheque, paiementVirement, rendreMonnaie, date };
          retourItem.client = utilisateurs.filter(itemClient => itemClient._id === item.client)[0];
          retourItem.client = retourItem.client.nom +" "+retourItem.client.prenom;
          retourItem.dateString = id+";"+date.toLocaleDateString()+";CHEQUE";
          id++;
          retour.push(retourItem);
        } 

        
      });

      

      let dateBar = [...new Set(retour.map(item => item.dateString))];

      dateBar = dateBar.map(item => {
        const historiques = retour.filter(itemRetour => itemRetour.dateString === item);
        let result = {
          date: item,
          result: historiques.reduce((a, b) => {
            let detail = a.detail;

            if (b.client !== "") {
              detail.push(b.client);
            }

            return {
              paiement: parseFloat(a.paiement) + parseFloat(b.paiementEspece) - parseFloat(b.rendreMonnaie) + parseFloat(b.paiementCheque) + parseFloat(b.paiementVirement) ,
              detail
            }
          }, { paiement: 0.0, detail: [] })

        };

        return result;
      })

      let csv = 'date;type;montant;client\r\n';
      csv += dateBar.map(item => `${item.date.substring(item.date.indexOf(';')+1)};${item.result.paiement};${item.result.detail.join(',')}`).join('\r\n');

      res.set('Content-Disposition', 'attachment;filename=export.csv');
      res.set('Content-Type', 'application/octet-stream');
      res.send(csv.replace(/\./g, ','));
    })
  })
});

router.get('/ticketjour', (req, res) => {

  const dateAujourdhui = new Date();
  const dateMatin = new Date(dateAujourdhui.getFullYear(), dateAujourdhui.getMonth(), dateAujourdhui.getDate(), 0, 0, 0, 0);
  const dateSoir = new Date(dateAujourdhui.getFullYear(), dateAujourdhui.getMonth(), dateAujourdhui.getDate(), 23, 59, 59, 0);

  // variable pour le total du ticket
  let totalCredit = 0;
  let totalEspece = 0;
  let totalVirement = 0;
  let totalCheque = 0;
  let totalRendreMonnaie = 0;

  new Promise(resolve => {

    bdd.historique.find(
      {
        $or: [
          {
            $and: [
              { type: 'SOUM' },
              { date: { $gt: dateMatin } },
              { date: { $lt: dateSoir } },
              {
                $or: [
                  { paiementEspece: { $gt: 0 } },
                  { paiementCheque: { $gt: 0 } },
                  { paiementVirement: { $gt: 0 } },
                  { rendreMonnaie: { $gt: 0 } }
                ]
              }
            ]
          },
          {
            $and: [
              { type: 'POT' },
              { dateEncaissement: { $gt: dateMatin } },
              { dateEncaissement: { $lt: dateSoir } }
            ]
          },
          {
            $and: [
              { type: 'POT' },
              { datePaiement: { $gt: dateMatin } },
              { datePaiement: { $lt: dateSoir } }
            ]
          },
        ]

      }
    ).sort({ date: -1 }).exec((err, histos) => {

      const tab = [];

      histos.forEach(histo => {
        tab.push(new Promise(resolveClient => {
          bdd.utilisateur.findOne({ _id: histo.client }, (err, client) => {
            histo.client = client;

            if (histo.rendreMonnaie >= 0) {
              totalEspece += parseFloat(histo.paiementEspece.toString().replace(',', '.'));
              totalVirement += parseFloat(histo.paiementVirement.toString().replace(',', '.'));
              totalCheque += parseFloat(histo.paiementCheque.toString().replace(',', '.'));
              totalRendreMonnaie += parseFloat(histo.rendreMonnaie.toString().replace(',', '.'));
            } else {
              totalCredit += histo.rendreMonnaie;
            }

            histo.dateString = new Date(histo.date).toLocaleDateString().split('-').reverse().map(item => item.toString().padStart(2, '0')).join('/');
            histo.heureString = new Date(histo.date).toLocaleTimeString().split(':').map(item => item.toString().padStart(2, '0')).join(':')
            resolveClient();
          });
        }))
      });

      Promise.all(tab).then(() => {

        const total = {
          paiementEspece: totalEspece,
          paiementVirement: totalVirement,
          paiementCheque: totalCheque,
          rendreMonnaie: totalRendreMonnaie,
          credit: totalCredit,
          total: (totalCheque + totalEspece + totalVirement) - totalRendreMonnaie + totalCredit
        };

        const histosParBarman = [];
        histos.forEach(item => {
          let histoBarman = histosParBarman.find(itemBarman => JSON.stringify(itemBarman.barman) === JSON.stringify(item.barman));
          if (typeof histoBarman === "undefined") {
            histoBarman = { barman: item.barman, histos: [item] };
            histosParBarman.push(histoBarman);
          } else {
            histoBarman.histos.push(item);
          }
        });

        bdd.pots.find({ etat: 'Paiement' }).sort({ date: -1 }).exec((err, potsNonTermines) => {
          resolve({ histosParBarman, total, potsNonTermines });
        });


      })
    });
  }).then(result => {

    const { histosParBarman, total, potsNonTermines } = result;

    const paramPage = { size: 'A4', margin: 10 };

    const doc = new PDFDocument(paramPage);

    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));


    var dS = `${dateAujourdhui.getFullYear()}_${(dateAujourdhui.getMonth() + 1).toString().padStart(2, '0')}_${(dateAujourdhui.getDate()).toString().padStart(2, '0')}`;
    let filename = `ticketjour_${dS}`;
    filename = encodeURIComponent(filename) + '.pdf'
    res.setHeader('Content-disposition', 'attachment; filename="' + filename + '"')
    res.setHeader('Content-type', 'application/pdf')

    doc.on('end', () => {
      if (typeof req.query.mail !== "undefined") {
        let pdfData = Buffer.concat(buffers);
        let dateJourString = new Date().toLocaleDateString().split('-').reverse().map(item => item.toString().padStart(2, '0')).join('/');

        bdd.utilisateur.find({ profils: { $elemMatch: { nom: 'Gestionnaire' } } }).sort({ nom: 1 }).exec((err, gestionnaires) => {


          Mail.envoyerMail({
            from: 'SOUM',
            to: [...new Set(gestionnaires.map(item => item.mail))],
            subject: `Ticket du jour ${dateJourString}`,
            html: `<h1>Bonjour, <br /> <br/> Veuillez trouver en pièce jointe le ticket du jour ${dateJourString}.<br/><br/>Amicalement</h1>`,
            attachments: [
              {
                filename,
                content: pdfData
              },
            ]
          });
        });
      }
    });

    // Parametre d'une feuille A4
    const margeX = 10;
    const margeY = 10;
    const largeurPage = (21 / 2.54 * 72) - margeX * 2;
    const hauteurPage = (29.7 / 2.54 * 72) - margeY * 2;
    const hauteurLigne = 15;
    const param = { doc, margeX, margeY, largeurPage, hauteurPage, hauteurLigne };

    // position curseur
    let x = 0;
    let y = 0;

    // Largeur colonne
    let colonne = [0, 18, 23.5, 70, 80, 90, 100].map((item, idx, array) => (
      {
        x: largeurPage * item / 100,
        largeur: (array[idx + 1] - item) * largeurPage / 100
      }
    ))

    let colonne2 = [0, 18, 23.5, 70, 100].map((item, idx, array) => (
      {
        x: largeurPage * item / 100,
        largeur: (array[idx + 1] - item) * largeurPage / 100
      }
    ))


    const afficherEntete = doc => {
      param.backgroundColor = BLEU;
      param.color = 'white';
      ["DATE", "TYPE", "CLIENT", "Espèce", "Chèque", "Virement"].forEach((item, index) => {
        let colonneEC = colonne[index];
        let text = item;
        ecrireText(param, text, y, colonneEC, "center");
      });
      delete param.backgroundColor;
      param.color = 'black';
      y = y + hauteurLigne;
    };


    const ajouterPage = () => {
      y = 0;
      doc.addPage(paramPage);
      ajouterImage(param, 15, 15);
    }

    // Affichage détaillé par client
    let colonneEC, text;

    ajouterImage(param, 15, 15);

    doc.fontSize(20);
    text = "Ticket récapitulalif du " + dateAujourdhui.toLocaleDateString().split('-').reverse().map(item => item.toString().padStart(2, '0')).join('/');
    doc.text(text, margeX + x, margeY + y, { width: largeurPage, align: "center" });
    y += 25;

    doc.fontSize(8);
    text = `edité par ${req.user.nom} ${req.user.prenom} à ${dateAujourdhui.toLocaleTimeString().split(':').map(item => item.toString().padStart(2, '0')).join(':')}`
    doc.text(text, margeX + x, margeY + y, { width: largeurPage, align: "center" });
    y += 8;

    histosParBarman.map(histoParBarman => {

      const { histos, barman } = histoParBarman;

      y += 5;

      doc.fontSize(15);
      text = "Barman " + barman.nom + " " + barman.prenom;
      doc.text(text, margeX + x, margeY + y, { width: largeurPage, align: "left" });
      y += 20;

      afficherEntete(doc);
      histos.forEach(histo => {
        if (y + hauteurLigne > hauteurPage) {
          ajouterPage();
          afficherEntete();
        }

        // date
        colonneEC = colonne[0];
        text = `${histo.dateString} ${histo.heureString.toString().replace('PM', '').replace('AM', '')}`;
        ecrireText(param, text, y, colonneEC, "center");

        // type
        colonneEC = colonne[1];
        text = `${histo.type} `;
        ecrireText(param, text, y, colonneEC, "center");

        // nom
        colonneEC = colonne[2];
        text = histo.client.nom + " " + histo.client.prenom;
        ecrireText(param, text, y, colonneEC, "left");



        if (histo.rendreMonnaie < 0) {
          colonneEC = colonne2[3];
          text = `${histo.rendreMonnaie} €`;

          param.backgroundColor = 'red';
          ecrireText(param, text, y, colonneEC, "center");
          delete param.backgroundColor;
        } else {
          // espece
          colonneEC = colonne[3];
          text = histo.paiementEspece - histo.rendreMonnaie + " €";
          ecrireText(param, text, y, colonneEC, "center");

          // cheque
          colonneEC = colonne[4];
          text = histo.paiementCheque + " €";
          ecrireText(param, text, y, colonneEC, "center");

          // virement
          colonneEC = colonne[5];
          text = histo.paiementVirement + " €";
          ecrireText(param, text, y, colonneEC, "center");
        }

        y = y + hauteurLigne;
      });

    })

    colonne = [0, 25, 50, 100].map((item, idx, array) => (
      {
        x: largeurPage * item / 100,
        largeur: (array[idx + 1] - item) * largeurPage / 100
      }
    ));

    [
      { label: "Total Espèce", fond: BLEU, texteCouleur: ORCLAIR, valeur: (total.paiementEspece - total.rendreMonnaie).toFixed(2) + " €" },
      { label: "Total Chèque", fond: BLEU, texteCouleur: ORCLAIR, valeur: total.paiementCheque.toFixed(2) + " €" },
      { label: "Total Virement", fond: BLEU, texteCouleur: ORCLAIR, valeur: total.paiementVirement.toFixed(2) + " €" },
      { label: "Total crédit", fond: BLEU, texteCouleur: ORCLAIR, valeur: total.credit.toFixed(2) + " €" },
      { label: "Total encaissement", fond: OR, texteCouleur: BLEU, valeur: total.total.toFixed(2) + " €" },
    ].forEach(itemTotal => {

      //Saut de ligne
      if (y + hauteurLigne > hauteurPage) {
        ajouterPage();
      } else {
        y = y + hauteurLigne;
      }

      // espece
      colonneEC = colonne[0];
      text = itemTotal.label;
      param.backgroundColor = itemTotal.fond;
      param.color = itemTotal.texteCouleur;
      ecrireText(param, text, y, colonneEC, "center");
      delete param.backgroundColor;
      param.color = 'black';

      // espece
      colonneEC = colonne[1];
      text = itemTotal.valeur;
      ecrireText(param, text, y, colonneEC, "center");
    })


    if (potsNonTermines.length > 0) {
      // saut de page 
      ajouterPage();

      doc.fontSize(20);
      text = "Pot(s) en attente de réglement";
      doc.text(text, margeX + x, margeY + y, { width: largeurPage, align: "center" });
      y += 25;

      potsNonTermines.forEach(item => {
        const participants = item.participants.filter(participant => !participant.paye);

        doc.fontSize(12);
        text = `Pot du ${new Date(item.date).toLocaleDateString().split('-').reverse().map(item => item.toString().padStart(2, '0')).join('/')} : ${item.titre}`;
        doc.text(text, margeX + x, margeY + y, { width: largeurPage, align: "center" });
        y += 15;

        doc.fontSize(8);
        participants.forEach(participant => {
          text = `${participant.nom} ${participant.prenom} : ${participant.renduMonnaie * -1}€`
          doc.text(text, margeX + x, margeY + y, { width: largeurPage, align: "left" });
          y += 15;
        });
      })

    }
    doc.pipe(res);
    doc.end();
  });
});

module.exports = router;