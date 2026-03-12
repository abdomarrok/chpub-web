# 03 Alucobond Configurator

## Implémentation réalisée
- **Architecture Native CSS 3D** : 
  - Abandon de Three.js au profit de transformations CSS 3D natives pour une performance instantanée (0ms load path).
  - Utilisation de `preserve-3d` sur le conteneur et transformations `rotate`, `translateZ` pour construire un volume 3D interactif.
- **Interaction Avancée** :
  - **Tilt Dynamique** : Interaction au mouvement de souris permettant une sensation de profondeur et de reflet métallique sans freeze.
  - **Auto-Scaling** : Le panneau s'ajuste visuellement dans son conteneur tout en conservant les proportions saisies.
  - **Labels Overlays** : Affichage des dimensions (W, H) via des overlays CSS sombres et élégants.
- **Contrôles Hybrides** :
  - Synchronisation bidirectionnelle entre les `range sliders` et les `number inputs` manuels.

## Décisions et raisons
- **Performance** : Le CSS 3D évite le parsing de shaders 3D et le chargement de bibliothèques lourdes, ce qui est crucial pour les utilisateurs mobiles en Algérie.
- **UX** : L'ajout de l'entrée manuelle (clavier) compense l'imprécision des sliders sur de grandes dimensions (ex: 12.5m).
- **Rendu Visuel** : Utilisation de gradients CSS et de pseudo-éléments `::before` pour simuler un reflet métallique dynamique ("Metalic Shine") qui suit la souris.

## Écarts par rapport au prompt initial
- **Extension 3D** : Le projet a évolué d'un configurateur 2D (Panneau plat) vers un configurateur de Volume 3D complet pour mieux répondre aux besoins de pose (faces latérales).
