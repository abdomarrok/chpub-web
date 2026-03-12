# 01 Architecture

## Implémentation réalisée
- **Structure des fichiers** : Projet Vanilla JS divisé en HTML (`index.html`), CSS module par module (`base.css`, `layout.css`, `components.css`, `animations.css`, `print.css`), et JS indépendant (`config.js`, `main.js`, `configurator.js`, `websites.js`, `devis.js`, `three-scene.js`).
- **Logique** : Aucune bibliothèque frontend (Frameworks) ni outil de build n'est requis. Le site fonctionne hors ligne (après le premier cache).
- **Sémantique & Accessibilité** : Utilisation stricte des balises HTML5 (`<header>`, `<main>`, `<section>`, `<footer>`, `<article>`, `<nav>`). Gestion ARIA appliquée sur les repères (`role="region"`, `aria-labelledby`, `aria-hidden`, `aria-label`).
- **Navigation** : Indicateur de défilement, liens internes doux via `scroll-behavior: smooth` (avec pad en haut pour le header fixe). Menu hamburger mobile accessible implémenté.

## Décisions et raisons
- **Modèle de données unique** : Le fichier `config.js` est le point de vérité unique (SSOT - Single Source Of Truth). Le HTML est injecté dynamiquement depuis ce fichier pour éviter les prix ou données encodés en dur.
- **Chargement différé (Defer & Module)** : Tous les scripts sont chargés avec `type="module"` ou l'attribut `defer` pour supprimer les ressources bloquant le rendu, garantissant de bons scores Lighthouse.

## Écarts par rapport au prompt strict
- Aucun écart majeur. Les exigences de Vanilla JS pur (sauf Theee.js via CDN externe structuré et chargé dynamiquement) et de l'architecture ont été rigoureusement respectées.
