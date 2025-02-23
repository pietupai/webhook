const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');
//const fetch = require('node-fetch');
//const events = require('events');

const app = express();
app.use(bodyParser.json());
app.use(cors());

let cache = {}; // In-memory cache

//const eventEmitter = new events.EventEmitter();

// Serve static files : tarvitaan että index.html toimii myös local
//app.use(express.static(path.join(__dirname, '../public')));   // from 'public' directory
app.use(express.static(path.join(__dirname, '../')));        // from root     

app.post('/api/webhook', (req, res) => {
//app.post('/api/webhook', async (req, res) => {
  const body = req.body;
  console.log('Webhook event received:', body);

  // Store the content in the cache
  cache = { content: body };
  console.log('Cache updated:', cache); // Logging to track cache updates

  // Fetch the updated response.txt content
  //const response = await fetch('https://api.github.com/repos/pietupai/hae/contents/response.txt');
  //const data = await response.json();
  //const decodedContent = Buffer.from(data.content, 'base64').toString('utf8');

  // Emit event with the updated content
  console.log('Emitting event: newWebhook');
  //eventEmitter.emit('newWebhook', decodedContent);

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

  //const keepAlive = setInterval(() => { res.write(': keep-alive\n\n'); console.log('Keep-alive message sent'); }, 15000);

  const listener = (data) => {
    console.log('Sending data to SSE client:', data);
    res.write(`data: ${data}\n\n`);
  };

  //eventEmitter.on('newWebhook', listener);

  req.on('close', () => {
    //clearInterval(keepAlive);
    eventEmitter.removeListener('newWebhook', listener);
    console.log('SSE connection closed');
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
