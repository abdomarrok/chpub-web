# 05 Devis System

## Implémentation réalisée
- **Architecture de la vue** : Le formulaire est divisé en deux. À gauche : les champs et contrôles. À droite : L'aperçu en direct imitant structurellement une facture/devis agence propre.
- **Remplissage Formulaire** : La liste des 58 Wilayas est injectée via JS. Les champs transmettent leurs informations au `#devis-document` au fur et à mesure de leur écriture.
- **Rapport de configuration** : Le devis inclut le détail précis du panneau (Largeur, Hauteur) ainsi que le détail des options (Installation, Conception) pour une transparence totale.
- **Optimisation Impression** :
  - Utilisation de `display: none !important` dans `print.css` au lieu de `visibility: hidden` pour éliminer les espaces blancs et les pages inutiles.
  - Mise en page forcée en A4 Portrait avec isolation stricte du `#devis-document`.
- **Intégration WhatsApp** : Génération d'un message pré-rempli structuré pour faciliter la conversion commerciale.

## Décisions et raisons
- **Print Accuracy** : Le passage au `display: none` était nécessaire pour corriger les bugs de pagination sur Chrome/Edge.
- **Conversion** : L'inclusion des dimensions précises et des options détaillées dans le devis évite les malentendus lors de la signature du document.

## Écarts par rapport au prompt strict
- **Zéro Backend** : Tout se déroule de frontend à frontend. La sauvegarde persistance est volontairement hors-scope pour maximiser la vitesse et la simplicité de maintenance.
