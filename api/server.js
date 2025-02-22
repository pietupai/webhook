const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '../public')));

let cache = {}; // In-memory cache

app.post('/api/webhook', (req, res) => {
  const body = req.body;
  console.log('Webhook event received:', body);

  // Store the content in the cache
  cache = { content: body };
  console.log('Cache updated:', cache); // Logging to track cache updates

  res.status(200).send('Webhook received');
});

app.get('/api/poll', (req, res) => {
  console.log('Polling endpoint hit'); // Log to ensure the endpoint is hit
  console.log('Cache accessed:', cache); // Logging to track cache access
  if (!cache.content) {
    console.log('No data available in cache');
    return res.status(404).send('No data available');
  }
  res.status(200).send(cache);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
