const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const events = require('events');

const app = express();
app.use(bodyParser.json());
app.use(cors());

// Serve static files : tarvitaan local index.html
//app.use(express.static(path.join(__dirname, '../public')));  //  from the 'public' directory
app.use(express.static(path.join(__dirname, '../')));   // from root

let cache = {}; // In-memory cache
const eventEmitter = new events.EventEmitter();

app.post('/api/webhook', (req, res) => {
  const body = req.body;
  console.log('Webhook event received:', body);

  // Store the content in the cache
  cache = { content: body };
  console.log('Cache updated:', cache); // Logging to track cache updates

  // Emit event with the updated content
  console.log('Emitting event: newWebhook');
  const decodedContent = body.content;
  eventEmitter.emit('newWebhook', decodedContent);

  res.status(200).send('Webhook received');
});

app.get('/api/poll', (req, res) => {
  console.log('Polling endpoint hit'); // Log to ensure the endpoint is hit
  console.log('Cache accessed:', cache); // Logging to track cache access
  if (!cache.content) {
    console.log('No data available in cache');
    return res.status(200).send({ message: 'No data available' });
  }
  res.status(200).send(cache);
});

// SSE endpoint
app.get('/api/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  console.log('SSE connection established');

  const keepAlive = setInterval(() => {  res.write(': keep-alive\n\n'); console.log('Keep-alive message sent'); }, 15000);

  const listener = (data) => {
    console.log('Sending data to SSE client:', data);
    res.write(`data: ${data}\n\n`);
  };

  eventEmitter.on('newWebhook', listener);

  req.on('close', () => {
    clearInterval(keepAlive);
    eventEmitter.removeListener('newWebhook', listener);
    console.log('SSE connection closed');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
