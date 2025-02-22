const express = require('express');

const app = express();

app.get('/api/poll', (req, res) => {
  if (!cache.content) {
    return res.status(404).send('No data available');
  }
  res.status(200).send(cache);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Polling server is running on port ${PORT}`);
});

module.exports = app;
