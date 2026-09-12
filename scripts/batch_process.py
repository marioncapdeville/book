#!/usr/bin/env python3
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from process_images import process_folder

BOOK = Path("/Users/marioncapdeville/Documents/BOOK")
DEST = Path("/Users/marioncapdeville/Documents/brief-book/src/images/uploads")

MAPPING = [
    # (source folder relative to BOOK, category slug, project slug)
    ("02 - Stylisme photo - 12/Florilège", "stylisme-photo", "florilege"),
    ("02 - Stylisme photo - 12/Logis de la Cadène - Artichauts des Landes", "stylisme-photo", "logis-artichauts-des-landes"),
    ("02 - Stylisme photo - 12/Logis de la Cadène - Chocolat", "stylisme-photo", "logis-chocolat"),
    ("02 - Stylisme photo - 12/Logis de la Cadène - Les cassolettes", "stylisme-photo", "logis-les-cassolettes"),
    ("02 - Stylisme photo - 12/Logis de la Cadène - Lieu jaune de Saint-Gilles-Croix-de-Vie", "stylisme-photo", "logis-lieu-jaune-saint-gilles-croix-de-vie"),
    ("02 - Stylisme photo - 12/Logis de la Cadène - amuse-bouche", "stylisme-photo", "logis-amuse-bouche"),
    ("02 - Stylisme photo - 12/Seconde peau - experimentations de matières", "stylisme-photo", "seconde-peau"),
    ("02 - Stylisme photo - 12/Tempo d'Angelus", "stylisme-photo", "tempo-dangelus"),
    ("02 - Stylisme photo - 12/le gabriel - fromage et vaisselle", "stylisme-photo", "le-gabriel-fromage-et-vaisselle"),
    ("02 - Stylisme photo - 12/le gabriel - l'artichaut", "stylisme-photo", "le-gabriel-artichaut"),
    ("02 - Stylisme photo - 12/le gabriel - les canelés", "stylisme-photo", "le-gabriel-caneles"),
    ("02 - Stylisme photo - 12/le gabriel - les verres", "stylisme-photo", "le-gabriel-les-verres"),

    ("03 - Edition - 6/Angelus - carte de voeux 2025", "edition", "angelus-carte-de-voeux-2025"),
    ("03 - Edition - 6/Angelus - Reflet n°5", "edition", "angelus-reflet-5"),
    ("03 - Edition - 6/Angelus - Reflet n°6", "edition", "angelus-reflet-6"),
    ("03 - Edition - 6/Carte de voeux Marquise Contents", "edition", "carte-de-voeux-marquise"),
    ("03 - Edition - 6/Logis - bons cadeaux", "edition", "logis-bons-cadeaux"),
    ("03 - Edition - 6/Logis - menu", "edition", "logis-menu"),

    ("04 - Packaging & objets - 6/Angelus - Millésime 2022", "packaging-objets", "angelus-millesime-2022"),
    ("04 - Packaging & objets - 6/Immortelle", "packaging-objets", "immortelle-packaging"),
    ("04 - Packaging & objets - 6/Logis - porte menu", "packaging-objets", "logis-porte-menu"),
    ("04 - Packaging & objets - 6/Millésime 2024", "packaging-objets", "millesime-2024"),
    ("04 - Packaging & objets - 6/Studio Tandem - Le vase", "packaging-objets", "studio-tandem-le-vase"),
    ("04 - Packaging & objets - 6/Studio Tandem - Les objets", "packaging-objets", "studio-tandem-les-objets"),

    ("05 - Travaux personnels - 7/angelus - expérimentations - le platre", "travaux-personnels", "angelus-experimentations-le-platre"),
    ("05 - Travaux personnels - 7/aquarelle-chanel", "travaux-personnels", "aquarelle-chanel"),
    ("05 - Travaux personnels - 7/dyptique-plv", "travaux-personnels", "diptyque-plv"),
    ("05 - Travaux personnels - 7/Les ombres", "travaux-personnels", "les-ombres"),
    ("05 - Travaux personnels - 7/Veuve Clicquot", "travaux-personnels", "veuve-clicquot"),
    ("05 - Travaux personnels - 7/visage en fleurs", "travaux-personnels", "visage-en-fleurs"),
    ("05 - Travaux personnels - 7/IA", "travaux-personnels", "ia"),

    ("Scénographie - Château Angelus - Vitrines des Caves Taillevent", "hors-categorie", "scenographie-caves-taillevent"),
]

if __name__ == "__main__":
    for src_rel, cat_slug, proj_slug in MAPPING:
        src = BOOK / src_rel
        dest = DEST / cat_slug / proj_slug
        print(f"\n=== {proj_slug} ({cat_slug}) ===")
        if not src.exists():
            print(f"  !! SOURCE MISSING: {src}")
            continue
        process_folder(src, dest)
