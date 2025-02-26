const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const events = require('events');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../')));

let cache = {}; // In-memory cache
const eventEmitter = new events.EventEmitter();

app.post('/api/webhook', (req, res) => {
  const body = req.body;
  console.log('Webhook event received:', body);

  // Ensure the cache content has a 'message' property
  cache = { content: { message: body.message || 'No message content' } };
  console.log('Cache updated:', cache);

  // Emit event with the updated content
  const decodedContent = JSON.stringify(cache);
  eventEmitter.emit('newWebhook', decodedContent);

  res.status(200).send('Webhook received');
});

app.get('/api/poll', (req, res) => {
  console.log('Polling endpoint hit');
  if (!cache.content) {
    return res.status(200).send({ message: 'No data available' });
  }
  res.status(200).send(cache);
});

// SSE endpoint
app.get('/api/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  console.log('SSE connection established');

  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 15000);

  const sendData = () => {
    if (cache.content) {
      const data = JSON.stringify(cache);
      console.log('Sending data to SSE client:', data);
      res.write(`data: ${data}\n\n`);
    }
  };

  eventEmitter.on('newWebhook', sendData);

  req.on('close', () => {
    clearInterval(keepAlive);
    eventEmitter.removeListener('newWebhook', sendData);
    console.log('SSE connection closed');
  });

  // Send initial data if available
  sendData();
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
