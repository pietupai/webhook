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

  // Store the content in the cache
  cache = { content: body };
  console.log('Cache updated:', cache); // Logging to track cache updates

  res.status(200).send('Webhook received');
});

app.get('/api/poll', (req, res) => {
  console.log('Polling endpoint hit');
  if (!cache.content) {
    return res.status(200).send({ message: 'No data available' });
  }
  res.status(200).send(cache);
});

// SSE endpoint with internal polling
app.get('/api/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  console.log('SSE connection established');

  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
  }, 5000); // Reduce interval to keep connection alive

  const sendData = () => {
    if (!cache.content) {
        res.write(`data: No data available'\n\n`);
        console.log('Cache content not available');
    } else {
        const data = JSON.stringify(cache);
        console.log('Sending data to SSE client:', data);
        res.write(`data: ${data}\n\n`);
    }
  };
    


  // Poll the server every 5 seconds
  const pollInterval = setInterval(sendData, 5000);

  req.on('close', () => {
    clearInterval(keepAlive);
    clearInterval(pollInterval);
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
