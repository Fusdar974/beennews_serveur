var express = require('express');
var router = express.Router();
var bdd = require('../bdd');

router.get('/:id', (req, res) => {
    bdd.typeproduit.findOne({ _id: req.params.id }, function (err, doc) {
        res.json({ typeproduit: doc });
    });
})

router.put('/:id', (req, res) => {
    bdd.typeproduit.update({ _id: req.params.id }, { $set: req.body.typeproduit }, {}, function (err, doc) {
        res.json({ typeproduit: doc });
    });
})

router.post('/create', (req, res) => {
    bdd.typeproduit.insert(req.body.typeproduit, function (err, doc) {

        doc.nombreProduits = 0;
        res.json({ typeproduit: doc });
    });
})

router.delete('/:id', (req, res) => {
    bdd.typeproduit.remove({ _id: req.params.id }, function (err, doc) {
        res.json({ typeproduit: doc });
    });
})

router.post('/', (req, res) => {
    bdd.typeproduit.find({}).sort({ nom: 1 }).exec(function (err, docs) {
        const tabPromise = [];
        docs.forEach(element => {
            tabPromise.push(new Promise(resolve => {
                bdd.produit.count({ type: element._id }, (err, count) => {
                    element.nombreProduits = count;
                    resolve();
                })
            }));
        });
        Promise.all(tabPromise).then(() => {
            res.json(docs);
        });

    });
})

module.exports = router;