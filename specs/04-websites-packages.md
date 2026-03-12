# 04 Websites Packages

## Implémentation réalisée
- **Forfaits et Options** : Rendu dynamique (DOM JS) des structures de cartes de sites web viaitération des clés du `.packages` dans `config.js`. 
- **Interactivité** : Sélections exclusives (une seule carte à la fois). Options cumulatives (cases à cocher multiples).
- **Calcul total en direct** : Si l'option "Sur Mesure" est cliquée (sans un prix fixe de départ, `null`), un label approprié s'affiche ("Sur devis").

## Décisions et raisons
- Structure de code modulaire (`websites.js`).
- Gestion de bouton : Le bouton "Demander ce forfait" finalise la création en redirigeant intelligemment vers le `#devis` de manière douce. Le bouton est désactivé si rien n'est sélectionné.

## Écarts par rapport au prompt strict
- Les fonctionnalités détaillées (ex. form contact, e-commerce, pages limitées vs illimitées) ne sont pas inscrites directement dans `config.js` global, car elles représentent la structure purement d'affichage sans tarif inhérent (elles ont été gérées dans `websites.js` directement).
