# Brief — Book en ligne de Marion (Directrice Artistique)

## Contexte
Site portfolio pour décrocher des missions freelance en direction artistique
(luxe, parfumerie, retail). Référence de style : https://alexiaroux.fr/

## Stack technique
- Site statique + Decap CMS (admin autonome, gratuit)
- Hébergement : Netlify (gratuit), code sur GitHub
- Nom de domaine : déjà chez OVH, à connecter en DNS une fois le site en ligne
- Générateur recommandé : Eleventy (11ty) — compatible Decap CMS, simple, statique

## Comptes déjà créés par Marion
- GitHub ✔
- Netlify ✔

## Source des visuels
Dossier Google Drive nommé "BOOK", structure :
```
BOOK/
├── 01 - Identité de marque - 4/
│   ├── LE GABRIEL/
│   ├── La Cave du Logis de la Cadène/
│   ├── IMMORTELLE/
│   └── STUDIO TANDEM/
├── 02 - Stylisme photo - 12/
│   ├── le gabriel - les verres/
│   ├── Logis de la Cadène - amuse-bouche/
│   ├── Logis de la Cadène - Lieu jaune de Saint-Gilles-Croix-de-Vie/
│   ├── Logis de la Cadène - Les cassolettes/
│   ├── le gabriel - les canelés/
│   ├── Logis de la Cadène - Artichauts des Landes/
│   ├── le gabriel - l'artichaut/
│   ├── Seconde peau - experimentations de matières/
│   ├── Florilège/
│   ├── Logis de la Cadène - Chocolat/
│   └── (sous-dossier Tempo d'Angelus)
├── 03 - Edition - 6/
├── 04 - Packaging & objets - 6/
├── 05 - Travaux personnels - 7/
└── Scénographie - Château Angelus - Vitrines des Caves Taillevent/
    (hors catégorie — visible uniquement dans "Tous les projets")
```
⚠️ Recommandation : installer l'app **Google Drive pour ordinateur** afin que ce
dossier soit synchronisé en local (Fichiers en continu / Miroir), ce qui permet
à Claude Code d'y accéder directement comme un dossier normal, sans passer par
l'API (bien plus rapide pour de gros volumes / fichiers lourds — certaines
photos du Gabriel font 15-25 Mo en brut, prévoir compression/redimensionnement
pour le web).

## Structure du menu (dans cet ordre)
Tous les projets · Identité de marque · Stylisme photo · Édition ·
Packaging & Objets · Travaux personnels · Manifeste

## Header
Nom de Marion + petit menu horizontal, dans l'esprit épuré du header de
maudvantours.com (logo/nom à gauche, menu à droite, "Fr / En" en haut à droite
— cette dernière fonctionnalité bilingue n'a pas été demandée explicitement,
à confirmer avec Marion si elle la veut).

## Page d'accueil — comportement (inspiration alexiaroux.fr)
- Grille de projets, TOUS mélangés (pas groupés par catégorie visuellement,
  pour que l'œil passe d'un sujet à l'autre)
- Chaque case = une image d'entrée (voir mapping ci-dessous)
- Fond de la case change de couleur au survol (couleur dominante extraite de
  l'image, comme sur alexiaroux.fr)
- Au survol : PAS de disparition de l'image. Un voile blanc LÉGER et
  semi-transparent apparaît par-dessus (l'image reste visible en transparence),
  avec :
  - Le nom du projet en gras, majuscules (ex: "IMMORTELLE")
  - En dessous, la catégorie en texte normal (ex: "Identité de marque")

## Visuel d'entrée par projet (page d'accueil)

### IDENTITÉ DE MARQUE
- Immortelle → `Identité - Immortelle 5`
- La Cave du Logis de la Cadène → `Logis de la Cadène_La Cave_5`
- Le Gabriel → `LE GABRIEL BORDEAUX` (sans suffixe numérique)
- Studio Tandem → `Identité - Studio Tandem 9`

### STYLISME PHOTO
- Florilège → `1985`
- Seconde peau → 2 entrées : `BOIS` et `SOIE`
- Tempo d'Angelus → `Angelus-Tempo-202509-43` et `Angelus-Tempo-202509-101`
- Le Gabriel - l'artichaut → `L'Observatoire du Gabriel_Artichauts © David Duchon-Doris (7)`
- Le Gabriel - fromage et vaisselle → `L'Observatoire du Gabriel_Fromages © David Duchon-Doris (2)`
- Le Gabriel - les canelés → `L'Observatoire du Gabriel_Canelés © David Duchon-Doris (5)`
- Le Gabriel - les verres → `L'Observatoire du Gabriel_Tableau Verres © David Duchon-Doris (2)`
- Logis de la Cadène - Artichauts des Landes → `Artichauts des Landes © David Duchon-Doris (3)`
- Logis de la Cadène - Chocolat → `Chocolat © David Duchon-Doris (3)`
- Logis de la Cadène - amuse-bouche → 2 entrées : `Amuse-bouche © David Duchon-Doris (2)` et `Amuse-bouche © David Duchon-Doris (5)`
- Logis de la Cadène - Les cassolettes → `Cassolettes © David Duchon-Doris (2)`
- Logis de la Cadène - Lieu jaune de Saint-Gilles-Croix-de-Vie → `Lieu jaune de Saint-Gilles-Croix-de-Vie © David Duchon-Doris (2)`

### ÉDITION
- Angelus - carte de vœux 2025 → `Marion-Book-202508-8`
- Angelus - Reflet n°5 → `Angelus - Reflet 8`, `Angelus - Enveloppe Reflet 7`, `Angelus - Marque-page Reflet`
- Angelus - Reflet n°6 → `Magazine-Mockup-Presentation-vol9` (mock-up à faire :
  voir section "Reflet n°6" plus bas — les 5 visuels HD de la maquette réelle
  ont déjà été extraits et livrés à Marion dans le chat précédent)
- Carte de vœux Marquise Contents → `marquise2`
- Logis - bons cadeaux → `Marion-Book-202508-38`
- Logis - menu → `Marion-Book-202508-29`

### PACKAGING & OBJETS
- Angelus - Millésime 2022 → `Château Angelus - Millésime 2022`
- Immortelle → `IMMORTELLE 23`
- Logis - porte-menu → `Marion-Book-202508-34`
- Millésime 2024 → `Château Angelus - Packaging Millésime 2024 3`
- Studio Tandem - Le vase → `Studio Tandem - Vase Léo-Ferdinand 11`
- Studio Tandem - Les objets → `Studio Tandem - Design d'objet 12`

### TRAVAUX PERSONNELS
- Angelus - expérimentations - le plâtre → `ANGELUS 20250431`
- Aquarelle Chanel → `Chanel ok 5`
- Diptyque PLV → `dyptique-figuier`
- Les ombres → `IMG_5847`
- Veuve Clicquot → `veuve-clicquot 5`
- Visage en fleurs → `u3159419293_surreal_portrait_of_a_woman_transforming_into_a_f_1c81a4c9-bb4e-4f7f-b17e-83899462f80e_3`
- IA → `u3159419293_A_surreal_conceptual_portrait_of_a_human_figure_e_1a2a9cb9-46b8-4d66-a6a1-78c54de5bbd7_2`

### HORS CATÉGORIE (visible uniquement dans "Tous les projets")
- Scénographie - Château Angelus - Vitrines des Caves Taillevent →
  `Château Angelus - Vitrines des Caves Taillevent 4`

## Page projet (au clic sur une case)
- En haut : informations façon la capture jointe par Marion (référence : page
  "HETCH x FORMICA" du site de Maud Vantours) — titre du projet, courte
  description/texte de présentation, catégorie, tags. NE PAS inclure les
  libellés "Info" et "Partager" (Marion les a explicitement exclus).
- Corps de page : galerie complète des visuels du projet (tous les fichiers
  du sous-dossier Drive correspondant, pas seulement le visuel d'entrée).
- En bas de page : section "projets similaires" — suggérer 2-3 autres projets
  (même catégorie ou tags proches) avec mini-vignettes cliquables.

## Admin (Decap CMS)
Doit permettre à Marion, sans toucher au code :
- Changer le visuel d'un projet (upload remplace l'existant)
- Ajouter / supprimer du texte de présentation
- Idéalement : ajouter un nouveau projet complet (titre, catégorie, visuels,
  texte) et réordonner/masquer des projets existants
Priorité : simplicité d'usage avant tout — Marion n'est pas développeuse.

## Reflet n°6 (mock-up édition)
Contexte : Reflet est le magazine haut de gamme d'Angelus, réalisé par Marion
de A à Z. Le fichier original n'existe qu'en maquette PDF (69 pages,
InDesign). Décision prise avec Marion : PAS de génération IA pour simuler
« tenu en main » ou « posé sur table » (rendu jugé peu crédible avec les
outils disponibles) — préférer de vraies photos prises par Marion elle-même
(magasine réel en main / posé sur bois-marbre, lumière naturelle).
Les 5 visuels HD suivants ont déjà été extraits de la maquette et remis à
Marion dans une conversation précédente (à intégrer si elle les fournit) :
couverture (texture papier micro-perforé), page "AC TUA LI TÉS" (bleu nuit),
page "RE GARDS" (feuille verte), double-page bouteilles Tempo, page
"À l'Observatoire" (salle à manger dorée).

## Ce qui reste à trancher avec Marion (ne pas halluciner de réponse)
- Fonctionnalité bilingue Fr/En : voulue ou juste un élément visuel du site
  de référence à ignorer ?
- Texte de présentation de chaque projet : à rédiger avec elle projet par
  projet, ou elle fournit les textes de son côté ?
- Ordre exact des projets dans "Tous les projets" (actuellement : mélangé,
  pas de logique stricte demandée au-delà de "on passe d'un sujet à l'autre")
