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
let LastData = "x";

app.post('/api/webhook', (req, res) => {
  const body = req.body;
  console.log('Webhook event received:', body);

  // Store the content in the cache
  cache = { content: body };
  console.log('Cache updated:', cache); // Logging to track cache updates

  // Emit event with the updated content
  console.log('Emitting event: newWebhook');
  const decodedContent = JSON.stringify(req.body);
  console.log("Emitting text: ", decodedContent);
  eventEmitter.emit('newWebhook', decodedContent);

  res.status(200).send('Webhook received');
});

app.get('/api/poll', (req, res) => {
  console.log('Polling cache');
  const sendData = () => {
    if (!cache.content) {
      //res.status(200).send({ message: 'No data available' });
    } else {
      if (cache != LastData) {
        //LastData = cache;        
        res.status(200).send(cache);
      };
      cache = {};
    }
  };
  req.on('close', () => {
    console.log('Connection closed');
  });
  sendData();
  console.log('Polling exit');
});

// SSE endpoint with internal polling
app.get('/api/sse', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  console.log('SSE connection established');

  const keepAlive = setInterval(() => { res.write(': keep-alive\n\n'); }, 15000); // Reduce interval to keep connection alive

  const listener = (data) => {
    console.log('Sending data to SSE client:', data);
    res.write(`data: ${data}\n\n`);
  };

  eventEmitter.removeAllListeners('newWebhook');
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
