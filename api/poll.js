const express = require('express');
const { getCache } = require('./cache');

const app = express();

app.get('/api/poll', (req, res) => {
  const cache = getCache();
  console.log('Cache accessed:', cache); // Logging to track cache access
  if (!cache.content) {
    console.log('No data available in cache');
    return res.status(404).send('No data available');
  }
  res.status(200).send(cache);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Polling server is running on port ${PORT}`);
});

module.exports = app;
