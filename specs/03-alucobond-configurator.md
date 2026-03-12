# 03 Alucobond Configurator

## Implémentation réalisée
- **Contrôles Actifs** : Formulaire utilisant des inputs natifs `<input type="range">` liés directement aux événements "input".
- **Three.js Minimaliste** :
  - Création de `three-scene.js`. 
  - Utilise `BoxGeometry` et `MeshStandardMaterial` simulé (Bordeaux métallique). 
  - Interpolation linéaire (Lerp) appliquée entre les changements de taille en X et Y pour une redimensionnement doux et non brusque.
  - OrbitControls inséré de façon asynchrone (lazy load addon).
- **Calculs** : Surface (m²), options (pourcentage ou fixes), calculs finaux lus instantanément depuis `config.js` et mis à jour via le DOM. 

## Décisions et raisons
- **Performance Three.js** : J'ai abaissé le `devicePixelRatio` maximum à 2 via `Math.min(window.devicePixelRatio, 2)` pour garantir la fluidité sur les appareils mobiles de milieu et bas de gamme.
- Les dimensions sont affichées dans une superposition HTML (`.dimension-overlay`) plutôt qu'en géométrie de texte 3D Three.js afin d'éviter le poids de la police JSON à charger en 3D.

## Écarts par rapport au prompt strict
- Aucun. L'expérience est conforme et performante.
