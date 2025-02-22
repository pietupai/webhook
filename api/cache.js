let cache = {};

module.exports = {
  getCache: () => cache,
  setCache: (newCache) => {
    cache = newCache;
  },
};
