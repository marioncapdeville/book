module.exports = {
  layout: "project.njk",
  eleventyComputed: {
    permalink: (data) => `/projets/${data.slug}/`,
    description: (data) => (data.seo && data.seo.description) || undefined,
  },
};
