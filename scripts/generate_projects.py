#!/usr/bin/env python3
import re
from pathlib import Path

UPLOADS = Path("/Users/marioncapdeville/Documents/brief-book/src/images/uploads")
PROJECTS_DIR = Path("/Users/marioncapdeville/Documents/brief-book/src/projects")

# (slug, category, title, tags, cover_filename, homepage_covers_or_None)
PROJECTS = [
    # Stylisme photo
    ("florilege", "stylisme-photo", "Florilège", ["stylisme photo", "art de la table"], "1985.jpg", None),
    ("logis-artichauts-des-landes", "stylisme-photo", "Logis de la Cadène — Artichauts des Landes", ["stylisme photo", "gastronomie"], "artichauts-des-landes-david-duchon-doris-3.jpg", None),
    ("logis-chocolat", "stylisme-photo", "Logis de la Cadène — Chocolat", ["stylisme photo", "gastronomie"], "chocolat-david-duchon-doris-3.jpg", None),
    ("logis-les-cassolettes", "stylisme-photo", "Logis de la Cadène — Les cassolettes", ["stylisme photo", "gastronomie"], "cassolettes-david-duchon-doris-2.jpg", None),
    ("logis-lieu-jaune-saint-gilles-croix-de-vie", "stylisme-photo", "Logis de la Cadène — Lieu jaune de Saint-Gilles-Croix-de-Vie", ["stylisme photo", "gastronomie"], "lieu-jaune-de-saint-gilles-croix-de-vie-david-duchon-doris-2.jpg", None),
    ("logis-amuse-bouche", "stylisme-photo", "Logis de la Cadène — Amuse-bouche", ["stylisme photo", "gastronomie"], "amuse-bouche-david-duchon-doris-2.jpg", ["amuse-bouche-david-duchon-doris-2.jpg", "amuse-bouche-david-duchon-doris-5.jpg"]),
    ("seconde-peau", "stylisme-photo", "Seconde peau — Expérimentations de matières", ["stylisme photo", "matières"], "bois.jpg", ["bois.jpg", "soie.jpg"]),
    ("tempo-dangelus", "stylisme-photo", "Tempo d'Angelus", ["stylisme photo", "parfumerie"], "angelus-tempo-202509-43.jpg", ["angelus-tempo-202509-43.jpg", "angelus-tempo-202509-101.jpg"]),
    ("le-gabriel-fromage-et-vaisselle", "stylisme-photo", "Le Gabriel — Fromages et vaisselle", ["stylisme photo", "gastronomie"], "l-observatoire-du-gabriel-fromages-david-duchon-doris-2.jpg", None),
    ("le-gabriel-artichaut", "stylisme-photo", "Le Gabriel — L'artichaut", ["stylisme photo", "gastronomie"], "l-observatoire-du-gabriel-artichauts-david-duchon-doris-7.jpg", None),
    ("le-gabriel-caneles", "stylisme-photo", "Le Gabriel — Les canelés", ["stylisme photo", "gastronomie"], "l-observatoire-du-gabriel-caneles-david-duchon-doris-5.jpg", None),
    ("le-gabriel-les-verres", "stylisme-photo", "Le Gabriel — Les verres", ["stylisme photo", "gastronomie"], "l-observatoire-du-gabriel-tableau-verres-david-duchon-doris-2.jpg", None),

    # Edition
    ("angelus-carte-de-voeux-2025", "edition", "Angelus — Carte de vœux 2025", ["édition", "papeterie"], "marion-book-202508-8.jpg", None),
    ("angelus-reflet-5", "edition", "Angelus — Reflet n°5", ["édition", "magazine"], "angelus-reflet-8.jpg", ["angelus-reflet-8.jpg", "angelus-enveloppe-reflet-7.jpg", "angelus-marque-page-reflet.jpg"]),
    ("angelus-reflet-6", "edition", "Angelus — Reflet n°6", ["édition", "magazine"], "magazine-mockup-presentation-vol9.jpg", None),
    ("carte-de-voeux-marquise", "edition", "Carte de vœux — Marquise Contents", ["édition", "papeterie"], "marquise2.jpg", None),
    ("logis-bons-cadeaux", "edition", "Logis — Bons cadeaux", ["édition", "papeterie"], "marion-book-202508-38.jpg", None),
    ("logis-menu", "edition", "Logis — Menu", ["édition", "papeterie"], "marion-book-202508-29.jpg", None),

    # Packaging & objets
    ("angelus-millesime-2022", "packaging-objets", "Angelus — Millésime 2022", ["packaging", "vin"], "chateau-angelus-millesime-2022.jpg", None),
    ("immortelle-packaging", "packaging-objets", "Immortelle", ["packaging", "parfumerie"], "immortelle-23.jpg", None),
    ("logis-porte-menu", "packaging-objets", "Logis — Porte-menu", ["packaging", "objet"], "marion-book-202508-34.jpg", None),
    ("millesime-2024", "packaging-objets", "Millésime 2024", ["packaging", "vin"], "chateau-angelus-packaging-millesime-2024-3.jpg", None),
    ("studio-tandem-le-vase", "packaging-objets", "Studio Tandem — Le vase", ["design d'objet", "packaging"], "studio-tandem-vase-leo-ferdinand-11.jpg", None),
    ("studio-tandem-les-objets", "packaging-objets", "Studio Tandem — Les objets", ["design d'objet", "packaging"], "studio-tandem-design-d-objet-12.jpg", None),

    # Travaux personnels
    ("angelus-experimentations-le-platre", "travaux-personnels", "Angelus — Expérimentations, le plâtre", ["travaux personnels", "matières"], "angelus-20250431.jpg", None),
    ("aquarelle-chanel", "travaux-personnels", "Aquarelle Chanel", ["travaux personnels", "illustration"], "chanel-ok-5.jpg", None),
    ("diptyque-plv", "travaux-personnels", "Diptyque PLV", ["travaux personnels", "packaging"], "dyptique-figuier.jpg", None),
    ("les-ombres", "travaux-personnels", "Les ombres", ["travaux personnels", "photographie"], "img-5847.jpg", None),
    ("veuve-clicquot", "travaux-personnels", "Veuve Clicquot", ["travaux personnels", "packaging"], "veuve-clicquot-5.jpg", None),
    ("visage-en-fleurs", "travaux-personnels", "Visage en fleurs", ["travaux personnels", "IA générative"], "u3159419293-surreal-portrait-of-a-woman-transforming-into-a-f-1c81a4c9-bb4e-4f7f-b17e-83899462f80e-3.jpg", None),
    ("ia", "travaux-personnels", "IA", ["travaux personnels", "IA générative"], "u3159419293-a-surreal-conceptual-portrait-of-a-human-figure-e-1a2a9cb9-46b8-4d66-a6a1-78c54de5bbd7-2.jpg", None),

    # Hors catégorie
    ("scenographie-caves-taillevent", "hors-categorie", "Scénographie — Château Angelus, Vitrines des Caves Taillevent", ["scénographie", "packaging"], "chateau-angelus-vitrines-des-caves-taillevent-4.jpg", None),
]


def natural_key(name):
    return [int(t) if t.isdigit() else t for t in re.split(r"(\d+)", name)]


def yaml_str(s):
    return '"' + s.replace('"', '\\"') + '"'


def build_markdown(slug, category, title, tags, cover_file, homepage_covers, order):
    folder = UPLOADS / category / slug
    files = sorted(
        [p.name for p in folder.iterdir() if p.suffix.lower() == ".jpg"],
        key=natural_key,
    )
    base = f"/images/uploads/{category}/{slug}"
    gallery = [f"{base}/{f}" for f in files]
    cover_path = f"{base}/{cover_file}"

    lines = ["---"]
    lines.append(f"title: {yaml_str(title)}")
    lines.append(f"slug: {slug}")
    lines.append(f"category: {category}")
    lines.append("tags:")
    for t in tags:
        lines.append(f'  - "{t}"')
    lines.append(f"cover: {yaml_str(cover_path)}")
    if homepage_covers:
        lines.append("homepageCovers:")
        for hc in homepage_covers:
            lines.append(f'  - "{base}/{hc}"')
    lines.append(f'excerpt: {yaml_str(title)}')
    lines.append(f"order: {order}")
    lines.append("hidden: false")
    lines.append("gallery:")
    for g in gallery:
        lines.append(f'  - "{g}"')
    lines.append("---")
    lines.append("Texte de présentation à rédiger avec Marion.")
    lines.append("")
    return "\n".join(lines)


if __name__ == "__main__":
    for i, (slug, category, title, tags, cover_file, homepage_covers) in enumerate(PROJECTS, start=100):
        content = build_markdown(slug, category, title, tags, cover_file, homepage_covers, order=i)
        out_path = PROJECTS_DIR / f"{slug}.md"
        out_path.write_text(content, encoding="utf-8")
        print(f"wrote {out_path.name} ({category})")
