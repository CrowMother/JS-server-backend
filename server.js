// server.js
const express = require('express');

require('dotenv').config();


const {process_webhook } = require('./processing');

// Set up Express app
const app = express();
const PORT = process.env.PORT || 3000;



// Middleware to parse incoming JSON data
app.use(express.json());



// Route to handle incoming webhook data from Josh
app.post('/trades/josh', async (req, res) => {
  console.log(process.env.JOSH_DISCORD_CHANNEL_ID)
  process_webhook(req, res, process.env.JOSH_DISCORD_CHANNEL_ID, "@everyone")
});

//Route to handle incoming webhook data from Noob
app.post('/trades/noob', async (req, res) => {
  console.log(process.env.NOOD_DISCORD_CHANNEL_ID)
  process_webhook(req, res, process.env.NOOD_DISCORD_CHANNEL_ID, "")
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });




// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});






