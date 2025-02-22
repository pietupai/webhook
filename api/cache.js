let cache = {};

module.exports = {
  getCache: () => {
    console.log('Getting cache:', cache); // Logging to track cache retrieval
    return cache;
  },
  setCache: (newCache) => {
    cache = newCache;
    console.log('Cache updated:', cache); // Logging to track cache updates
  },
};
