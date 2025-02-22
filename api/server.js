const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let cache = {}; // In-memory cache
let clients = []; // List of SSE clients

app.post('/api/webhook', (req, res) => {
  const body = req.body;
  console.log('Webhook event received:', body);

  // Store the content in the cache
  cache = { content: body };
  console.log('Cache updated:', cache); // Logging to track cache updates

  // Send update to all connected clients
  clients.forEach(client => client.res.write(`data: ${JSON.stringify(cache)}\n\n`));

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

app.get('/api/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Send headers to establish SSE connection

  // Send initial data
  res.write(`data: ${JSON.stringify(cache)}\n\n`);

  const clientId = Date.now();
  const newClient = { id: clientId, res };
  clients.push(newClient);

  console.log(`Client ${clientId} connected`);

  req.on('close', () => {
    console.log(`Client ${clientId} disconnected`);
    clients = clients.filter(client => client.id !== clientId);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
