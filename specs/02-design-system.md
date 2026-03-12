# 02 Design System

## Implémentation réalisée
- **Variables CSS** : Implémentation de toutes les couleurs (Bordeaux/Or/Dark) et de la typographie via `:root` dans `base.css`.
- **Typographie Bilingue** : 
  - `Playfair Display` pour le Français / Titres majeurs.
  - `Cairo` pour l'Arabe (avec l'attribut `dir="rtl"` spécifié).
  - `Montserrat` pour les descriptions de corps et l'UI générale.
- **Grilles & Layout** : Disposition réactive orientée mobile-first. Systèmes CSS Grid implémentés pour `.services-grid`, `.packages-grid`, `.devis-grid`, `.contact-grid`, etc.
- **Animations** : Observateur d'intersection (Intersection Observer) gérant l'apparition séquentielle fluide (`.reveal`) pour respecter la performance (`will-change` appliqué temporairement).

## Décisions et raisons
- L'isolation du code CSS (`layout`, `components`, `animations`) permet une maintenabilité simplifiée. 
- Les ombres dynamiques (`var(--shadow-glow)`) ne sont appliquées qu'au survol (hover/focus-visible) pour ne pas affecter les performances (FPS) du scroll principal.

## Écarts par rapport au prompt strict
- Ajout d'une marge compensatoire `scroll-padding-top` pour éviter que les titres des sections soient cachés par le `header` "fixed" lors du clic depuis la navigation.
