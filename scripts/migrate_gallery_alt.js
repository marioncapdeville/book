const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const dir = path.join(__dirname, "..", "src", "projects");
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".md"));

for (const file of files) {
  const filePath = path.join(dir, file);
  const raw = fs.readFileSync(filePath, "utf8");
  const match = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    console.warn(`!! no front matter found in ${file}`);
    continue;
  }
  const [, fmText, body] = match;
  const data = yaml.load(fmText);

  if (!Array.isArray(data.gallery)) {
    console.warn(`!! no gallery array in ${file}`);
    continue;
  }

  // Skip if already migrated (objects instead of strings)
  if (typeof data.gallery[0] === "object") {
    console.log(`already migrated: ${file}`);
    continue;
  }

  data.gallery = data.gallery.map((src) => ({ image: src, alt: data.title }));

  const newFm = yaml.dump(data, { lineWidth: -1, quotingType: '"', forceQuotes: false });
  const newContent = `---\n${newFm}---\n${body}`;
  fs.writeFileSync(filePath, newContent, "utf8");
  console.log(`migrated: ${file}`);
}
