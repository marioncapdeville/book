const Image = require("@11ty/eleventy-img");
const path = require("path");

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm"];

function publicPath(src) {
  return "/" + src.replace(/^\//, "");
}

async function imageShortcode(src, alt, sizes = "(min-width: 900px) 33vw, 100vw", loading = "lazy") {
  if (!src) return "";
  if (alt === undefined) {
    throw new Error(`Attribut alt manquant pour l'image : ${src}`);
  }

  const ext = path.extname(src).toLowerCase();

  // Vidéo : lue en boucle, silencieuse, comme un GIF animé.
  if (VIDEO_EXTENSIONS.includes(ext)) {
    return `<video src="${publicPath(src)}" autoplay muted loop playsinline aria-label="${alt}"></video>`;
  }

  // GIF : jamais transformé par eleventy-img (ça figerait l'animation), servi tel quel.
  if (ext === ".gif") {
    return `<img src="${publicPath(src)}" alt="${alt}" loading="${loading}" decoding="async">`;
  }

  const inputPath = path.join(__dirname, "src", src.replace(/^\//, ""));

  let metadata;
  try {
    metadata = await Image(inputPath, {
      widths: [400, 800, 1400, 2000, 2600],
      formats: ["webp", "jpeg"],
      outputDir: path.join(__dirname, "_site", "img"),
      urlPath: "/img/",
      sharpJpegOptions: { quality: 85 },
      sharpWebpOptions: { quality: 85 },
      filenameFormat: (id, src, width, format) => {
        const name = path.basename(src, path.extname(src));
        return `${name}-${width}w.${format}`;
      },
    });
  } catch (e) {
    console.warn(`Image introuvable ou illisible, ignorée : ${src}`);
    return "";
  }

  const imageAttributes = {
    alt,
    sizes,
    loading,
    decoding: "async",
  };

  return Image.generateHTML(metadata, imageAttributes);
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/images/uploads");
  eleventyConfig.addPassthroughCopy("src/files");
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  eleventyConfig.addAsyncShortcode("image", imageShortcode);

  eleventyConfig.addFilter("homepageEntries", function (projects) {
    const entries = [];
    for (const project of projects || []) {
      const covers = project.data.homepageCovers && project.data.homepageCovers.length
        ? project.data.homepageCovers
        : [project.data.cover];
      covers.forEach((cover, i) => {
        entries.push({ project, cover, key: `${project.data.slug}-${i}` });
      });
    }
    return entries;
  });

  eleventyConfig.addFilter("byCategory", function (items, category) {
    return (items || []).filter(
      (item) => item.data.category === category || (item.data.extraCategories || []).includes(category)
    );
  });

  const markdownIt = require("markdown-it")({ html: true, typographer: false });
  eleventyConfig.addFilter("mdInline", function (text) {
    return markdownIt.renderInline(String(text || ""));
  });

  // Nom court d'un projet : ce qui précède " - " dans le titre
  eleventyConfig.addFilter("shortName", function (title) {
    return String(title || "").split(" - ")[0].trim();
  });

  // Découpe le texte d'un projet en blocs (un bloc par intertitre H3)
  eleventyConfig.addFilter("sectionize", function (html) {
    const parts = String(html || "").split(/(?=<h3[\s>])/).map((p) => p.trim()).filter(Boolean);
    return parts.map((p) => `<section class="project__section">${p}</section>`).join("\n");
  });

  eleventyConfig.addFilter("withoutCategory", function (items, category) {
    return (items || []).filter((item) => item.data.category !== category);
  });

  eleventyConfig.addFilter("relatedProjects", function (items, currentSlug, currentCategory, limit = 4) {
    const others = (items || []).filter((item) => item.data.slug !== currentSlug);
    const sameCategory = others.filter((item) => item.data.category === currentCategory);
    const rest = others.filter((item) => item.data.category !== currentCategory);
    return sameCategory.concat(rest).slice(0, limit);
  });

  const CARD_FORMATS = ["1 / 1", "4 / 3", "3 / 4"]; // carré, paysage, portrait (repli automatique)
  const CARD_FORMAT_MAP = { carre: "1 / 1", paysage: "4 / 3", portrait: "3 / 4" };

  eleventyConfig.addFilter("cardFormat", function (chosenFormat, fallbackKey) {
    if (chosenFormat && CARD_FORMAT_MAP[chosenFormat]) return CARD_FORMAT_MAP[chosenFormat];
    let hash = 0;
    for (const ch of String(fallbackKey)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return CARD_FORMATS[hash % CARD_FORMATS.length];
  });

  eleventyConfig.addFilter("categoryLabel", function (slug, categories, lang) {
    const found = (categories || []).find((c) => c.slug === slug);
    if (!found) return slug;
    return lang === "en" && found.label_en ? found.label_en : found.label;
  });

  // ---------- Bilingue FR / EN ----------
  // Valeur d'un champ dans la langue demandée (repli sur le français si vide)
  function tr(data, field, lang) {
    if (lang === "en" && data && data.en) {
      const v = data.en[field];
      if (Array.isArray(v) ? v.length : (v !== undefined && v !== null && String(v).trim() !== "")) return v;
    }
    return data ? data[field] : undefined;
  }
  eleventyConfig.addFilter("tr", function (data, field, lang) { return tr(data, field, lang); });

  eleventyConfig.addFilter("md", function (text) {
    return markdownIt.render(String(text || ""));
  });

  eleventyConfig.addFilter("projectUrl", function (project, lang) {
    return lang === "en" ? `/en/projects/${project.data.slug}/` : project.url;
  });

  eleventyConfig.addFilter("findBySlug", function (items, slug) {
    return (items || []).find((item) => item.data.slug === slug);
  });

  eleventyConfig.addFilter("findByUrl", function (items, url) {
    return (items || []).find((item) => item.url === url);
  });

  eleventyConfig.addFilter("slugCategory", function (label) {
    return String(label)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  });

  function projectSortKey(item, orderIndex) {
    const slug = item.data.slug;
    const pos = orderIndex.has(slug) ? orderIndex.get(slug) : Infinity;
    return [pos, item.data.order || 0];
  }

  function sortByProjectOrder(items) {
    delete require.cache[require.resolve("./src/_data/projectOrder.json")];
    const projectOrder = require("./src/_data/projectOrder.json");
    const orderIndex = new Map(projectOrder.map((slug, i) => [slug, i]));
    return items.slice().sort((a, b) => {
      const [posA, orderA] = projectSortKey(a, orderIndex);
      const [posB, orderB] = projectSortKey(b, orderIndex);
      if (posA !== posB) return posA - posB;
      return orderA - orderB;
    });
  }

  eleventyConfig.addCollection("projects", function (collectionApi) {
    const items = collectionApi
      .getFilteredByGlob("src/projects/*.md")
      .filter((item) => !item.data.hidden);
    return sortByProjectOrder(items);
  });

  eleventyConfig.addCollection("projectsAll", function (collectionApi) {
    const items = collectionApi.getFilteredByGlob("src/projects/*.md");
    return sortByProjectOrder(items);
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
};
