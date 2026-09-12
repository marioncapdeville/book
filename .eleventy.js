const Image = require("@11ty/eleventy-img");
const path = require("path");

async function imageShortcode(src, alt, sizes = "(min-width: 900px) 33vw, 100vw", loading = "lazy") {
  if (!src) return "";
  if (alt === undefined) {
    throw new Error(`Attribut alt manquant pour l'image : ${src}`);
  }

  const inputPath = path.join(__dirname, "src", src.replace(/^\//, ""));

  let metadata;
  try {
    metadata = await Image(inputPath, {
      widths: [400, 800, 1400, 2000],
      formats: ["webp", "jpeg"],
      outputDir: path.join(__dirname, "_site", "img"),
      urlPath: "/img/",
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
  eleventyConfig.addPassthroughCopy("src/admin");
  eleventyConfig.addPassthroughCopy("src/css");
  eleventyConfig.addPassthroughCopy("src/favicon.svg");

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
    return (items || []).filter((item) => item.data.category === category);
  });

  eleventyConfig.addFilter("relatedProjects", function (items, currentSlug, currentCategory, limit = 3) {
    const others = (items || []).filter((item) => item.data.slug !== currentSlug);
    const sameCategory = others.filter((item) => item.data.category === currentCategory);
    const pool = sameCategory.length >= 2 ? sameCategory : others;
    return pool.slice(0, limit);
  });

  const CARD_FORMATS = ["1 / 1", "4 / 3", "3 / 4"]; // carré, paysage, portrait (repli automatique)
  const CARD_FORMAT_MAP = { carre: "1 / 1", paysage: "4 / 3", portrait: "3 / 4" };

  eleventyConfig.addFilter("cardFormat", function (chosenFormat, fallbackKey) {
    if (chosenFormat && CARD_FORMAT_MAP[chosenFormat]) return CARD_FORMAT_MAP[chosenFormat];
    let hash = 0;
    for (const ch of String(fallbackKey)) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    return CARD_FORMATS[hash % CARD_FORMATS.length];
  });

  eleventyConfig.addFilter("categoryLabel", function (slug, categories) {
    const found = (categories || []).find((c) => c.slug === slug);
    return found ? found.label : slug;
  });

  eleventyConfig.addFilter("slugCategory", function (label) {
    return String(label)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  });

  eleventyConfig.addCollection("projects", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/projects/*.md")
      .filter((item) => !item.data.hidden)
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
  });

  eleventyConfig.addCollection("projectsAll", function (collectionApi) {
    return collectionApi
      .getFilteredByGlob("src/projects/*.md")
      .sort((a, b) => (a.data.order || 0) - (b.data.order || 0));
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
