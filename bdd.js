'use strict';

const Datastore = require('nedb');
const DatastoreX = require('nedb-x');

const path = (process.env.NODE_ENV === 'development') ? './bddjwt' : '/bddjwt';

const db = {};
db.utilisateur = new Datastore({ filename: `${path}/utilisateur`, autoload: true });
db.produit = new Datastore({ filename: `${path}/produit`, autoload: true });
db.typeproduit = new Datastore({ filename: `${path}/typeproduit`, autoload: true });
db.historique = new Datastore({ filename: `${path}/historique`, autoload: true });
db.historiquedetail = new Datastore({ filename: `${path}/historiqueDetail`, autoload: true });
db.planning = new Datastore({ filename: `${path}/planning`, autoload: true });
db.pots = new Datastore({ filename: `${path}/pots`, autoload: true });
db.parametre = new Datastore({ filename: `${path}/parametre`, autoload: true });
db.cafe = new DatastoreX({ filename: `${path}/cafe`, autoload: true });
db.cafeconso = new DatastoreX({ filename: `${path}/cafeconso`, autoload: true });
db.cafeversement = new DatastoreX({ filename: `${path}/cafeversement`, autoload: true });
db.frigo = new Datastore({ filename: `${path}/frigo`, autoload: true });


module.exports = db;