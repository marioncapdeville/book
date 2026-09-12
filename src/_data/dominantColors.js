// Calcule automatiquement une couleur "dominante" (moyenne) pour chaque image
// d'upload, utilisée comme fond de case au survol sur la grille (cf brief).
// Résultat mis en cache sur disque pour ne pas retraiter les images à chaque build.
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const UPLOADS_DIR = path.join(__dirname, "..", "images", "uploads");
const CACHE_FILE = path.join(__dirname, "..", "..", ".cache", "dominant-colors.json");

function rgbToHex(r, g, b) {
  const toHex = (n) => n.toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function walk(dir) {
  let results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(walk(full));
    } else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) {
      results.push(full);
    }
  }
  return results;
}

module.exports = async function () {
  let cache = {};
  if (fs.existsSync(CACHE_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(CACHE_FILE, "utf8"));
    } catch (e) {
      cache = {};
    }
  }

  const colors = {};
  if (!fs.existsSync(UPLOADS_DIR)) return colors;

  const files = walk(UPLOADS_DIR);

  for (const file of files) {
    const urlPath = "/images/uploads/" + path.relative(UPLOADS_DIR, file).split(path.sep).join("/");
    const mtime = fs.statSync(file).mtimeMs;
    const cached = cache[urlPath];

    if (cached && cached.mtime === mtime) {
      colors[urlPath] = cached.color;
      continue;
    }

    const { data, info } = await sharp(file)
      .resize(1, 1, { fit: "fill" })
      .raw()
      .toBuffer({ resolveWithObject: true });

    const [r, g, b] = data;
    const hex = rgbToHex(r, g, b);
    colors[urlPath] = hex;
    cache[urlPath] = { color: hex, mtime };
  }

  fs.mkdirSync(path.dirname(CACHE_FILE), { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));

  return colors;
};
