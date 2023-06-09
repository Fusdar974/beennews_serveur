'use strict';

module.exports = [
    { _id: 1, icone: "mdi mdi-beehive-outline", nom: "Menu d'accueil", to: "/", libelle: 'Accueil', auth: false },
    { _id: 2, icone: "mdi mdi-bee", nom: "Mon Compte", to: "/compte", libelle: 'Mon compte', auth: true },

    { _id: 3, icone: "mdi mdi-table-large", nom: "Menu Planning barman", to: "/planningbarman", libelle: "Planning barman", auth: true },
    { _id: 4, icone: "mdi mdi-glass-mug", nom: "Menu SOUM", to: "/soum", libelle: "Soum", auth: true },
    { _id: 5, icone: "mdi mdi-party-popper", nom: "Menu POTS", to: "/pots", libelle: "Pot", auth: true },

    { _id: 6, icone: "mdi mdi-account-group", nom: "Menu utilisateur", to: "/users", libelle: "Clients", auth: true },
    { _id: 7, icone: "mdi mdi-flower", nom: "Menu stock", to: "/produits", libelle: "Stock", auth: true },
    { _id: 8, icone: "mdi mdi-cog", nom: "Menu type produits", to: "/typeproduits", libelle: "Paramètres", auth: true },

    { _id: 9, icone: "mdi mdi-coffee", nom: "Menu Café", to: "/cafe", libelle: "Café", auth: true },
    { _id: 10, icone: "mdi mdi-coffee", nom: "Torréfacteur Admin", to: "/cafe", libelle: "Café", auth: true },
    { _id: 11, icone: "mdi mdi-bitcoin", nom: "Rechargement BN", to: "/rechargementbn", libelle: "Rechargement BN", auth: true },
]