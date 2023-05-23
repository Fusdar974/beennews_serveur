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
    const {_id, nom, proposablePot, proposableSoum, ...otherParams} = req.body
    const filter = {_id, nom, proposablePot, proposableSoum}

    const errors = Object
        .keys(otherParams)
        .map(paramInError => `Le param ${paramInError} n'existe pas dans l'objet typeproduit.`)

    Object
        .entries(filter)
        .filter(param => typeof param[1]==="undefined")
        .forEach(paramToDelete => Reflect.deleteProperty(filter, paramToDelete[0]))

    if(errors.length >0 ) {
        res.status(500).send({ error: errors.join(' / ')})
    }else {
        bdd.typeproduit.find(filter).sort({ nom: 1 }).exec(function (err, docs) {
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
    }
})

module.exports = router;