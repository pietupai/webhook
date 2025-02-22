let cache = {};

module.exports = {
  getCache: () => cache,
  setCache: (newCache) => {
    cache = newCache;
    console.log('Cache updated:', cache); // Logging to track cache updates
  },
};
