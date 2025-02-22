const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { setCache } = require('./cache');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.post('/api/webhook', (req, res) => {
  const body = req.body;
  console.log('Webhook event received:', body);

  // Store the content in the cache
  setCache({ content: body });

  res.status(200).send('Webhook received');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Webhook server is running on port ${PORT}`);
});

module.exports = app;
