const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
const events = require('events');

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use(express.static(path.join(__dirname, '../')));   // from root

let cache = {}; // In-memory cache
const eventEmitter = new events.EventEmitter();

app.post('/api/webhook', (req, res) => {
  const body = req.body;
  console.log('Webhook event received:', body);

  // Store the content in the cache
  cache = { content: body };
  console.log('Cache updated:', cache);

  // Emit event with the updated content
  console.log('Emitting event: newWebhook');
  const decodedContent = JSON.stringify(req.body);
  console.log("Emitting text: ", decodedContent);
  eventEmitter.emit('newWebhook', decodedContent);

  res.status(200).send('Webhook received');
});

app.get('/api/poll', (req, res) => {
  console.log('Polling endpoint hit');
  console.log('Cache accessed:', cache);
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
  res.flushHeaders();

  console.log('SSE connection established');

  const keepAlive = setInterval(() => {
    res.write(': keep-alive\n\n');
    console.log('Keep-alive message sent');
  }, 15000);

  const listener = () => {
    if (cache.content) {
      const data = JSON.stringify(cache);
      console.log('Sending data to SSE client:', data);
      res.write(`data: ${data}\n\n`);
    }
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
