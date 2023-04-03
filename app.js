'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const auth = require('./middlewares/auth');
const users = require('./controllers/users');
const produits = require('./controllers/produits');
const typeproduits = require('./controllers/typeProduits');
const soum = require('./controllers/soum');
const login = require('./controllers/login');
const histo = require('./controllers/historique');
const planning = require('./controllers/planning');
const cafes = require('./controllers/cafes');
const pdf = require('./controllers/pdf');
const parametre = require('./controllers/parametre');
const pots = require('./controllers/pots');
const authPDF = require('./middlewares/authPDF');
const chargementDonnees = require('./helpers/helpers');
const config = require(`./config/${process.env.NODE_ENV}.json`);

// Création de la base de données
chargementDonnees.charger(config.chargement.donnees);

// Rendre le dossier image accessible
app.use('/image', express.static(path.join(__dirname, 'image/')));

// Mise à disposition du build react en mode production
app.use(express.static(path.join(__dirname, 'views/build/')));

// Transformation des données en JSON
app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  if (req.method !== 'OPTIONS') {
    console.log(req.method.padEnd(10, ' '), req.originalUrl);
  }
  next();
});


// Utilisation des controlleurs
app.use('/v1/login', login);
app.use('/v1/users', auth, users);
app.use('/v1/produits', auth, produits);
app.use('/v1/typeproduits', auth, typeproduits);
app.use('/v1/soum', auth, soum);
app.use('/v1/cafe', auth, cafes);
app.use('/v1/historique', auth, histo);
app.use('/v1/planning', auth, planning);
app.use('/v1/parametre', auth, parametre);
app.use('/v1/pdf', authPDF, pdf);
app.use('/v1/pots', auth, pots);

//Router react
app.get('*', (req, res) => { res.sendFile(path.join(__dirname + '/views/build/index.html')); });

module.exports = app;