# 05 Devis System

## Implémentation réalisée
- **Architecture de la vue** : Le formulaire est divisé en deux. À gauche : les champs et contrôles. À droite : L'aperçu en direct imitant structurellement une facture/devis agence propre.
- **Remplissage Formulaire** : La liste des 58 Wilayas est injectée via JS. Les champs transmettent leurs informations au `#devis-document` au fur et à mesure de leur écriture.
- **Intégration WhatsApp** : Un message est généré dynamiquement et encodé pour l'URL en utilisant les règles WA, assurant un pont avec les portables tout en esquivant le code de serveur backend complet.
- **Impression (`@media print`)** : En conjonction avec `print.css`, tout le site sauf la section `#devis-document` devient invisible, le CSS repositionne et réajuste les marges pour épouser le format papier/PDF A4 final.

## Décisions et raisons
- Les API des deux formulaires (Alucobond et Web) transmettent les prix à des inputs `<input type="hidden">` dans le Devis. 
- Formulaire natif en validation (HTML5 `required`). L'envoi vers WhatsApp vérifie que la validité (`checkValidity()`) est respectée, évitant des messages incomplets.

## Écarts par rapport au prompt strict
- Aucuns écarts. Tout se déroule de frontend à frontend. La sauvegarde persistance est volontairement hors-scope. L'impression native par le navigateur (PDF export) est fonctionnelle.
