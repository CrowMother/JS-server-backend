// server.js
const express = require('express');

require('dotenv').config();


const {process_webhook, process_webhook_unusual_options } = require('./processing');

// Set up Express app
const app = express();
const PORT = process.env.PORT || 3000;



// Middleware to parse incoming JSON data
app.use(express.json());



// Route to handle incoming webhook data from Josh
app.post('/trades/live_tracker', async (req, res) => {
  
  process_webhook(req, res)
});

//Route to handle incoming webhook data from Noob
app.post('/trades/noob', async (req, res) => {
  
  process_webhook(req, res)
});

app.post('/trades/UObot', async (req, res) => {
  
  process_webhook_unusual_options(req, res, process.env.UOBOT_DISCORD_CHANNEL_ID, "")
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });




// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});






