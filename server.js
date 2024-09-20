// server.js
const express = require('express');
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Set up Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Set up the Discord bot client
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Login to Discord bot
discordClient.login(process.env.DISCORD_TOKEN);

// Middleware to parse incoming JSON data
app.use(express.json());

//function to format incoming data into a ledgable state
function formatWebhookData(data, atEveyerone) {
    // Calculate Strike Price per unit
    const strikePricePerUnit = data.StrikePrice / data.Quantity / 100; // Assuming prices are in cents
  
    // Calculate Execution Price per unit
    const executionPricePerUnit = data.ExecutionPrice / data.Quantity;
  
    // Map OptionsQuote to "P" or "C"
    const optionsQuoteMap = {
      'Put': 'P',
      'Call': 'C',
    };
    const optionType = optionsQuoteMap[data.OptionsQuote] || data.OptionsQuote;
  
    // Format Option Expiry Date (if needed)
    const optionExpiryDate = data.OptionExpiryDate; // Assuming it's already in 'MM/DD/YY' format
  
    // Map OpenClosePositionCode to desired text
    const positionCodeMap = {
      'PC_Close': 'Closing position',
      'PC_Open': 'BTO',
    };
    const positionText = positionCodeMap[data.OpenClosePositionCode] || data.OpenClosePositionCode;
  
    if(atEveyerone){
      everyone = "@everyone"
    }
    else{
      everyone = ""
    }
    // Assemble the message
    const formattedMessage = `${data.UnderlyingSymbol} $${strikePricePerUnit.toFixed(2)} ${optionType} ${optionExpiryDate} @ $${executionPricePerUnit.toFixed(2)}: ${positionText} ${everyone}`;
  
    console.log('Formatted Message:', formattedMessage); // For debugging
  
    return formattedMessage;
  }

// Route to handle incoming webhook data from Josh
app.post('/trades/josh', async (req, res) => {
    try {
      // Log incoming webhook data for debugging
      console.log('Webhook received:', req.body);
  
      // Retrieve the Discord channel
      const channel = await discordClient.channels.fetch(process.env.JOSH_DISCORD_CHANNEL_ID);
  
      // Format the message using the formatting function
      const messageContent = formatWebhookData(req.body, true);
  
      // Send the formatted message to Discord
      await channel.send(messageContent);
  
      // Respond to the client
    // Respond to the client with a JSON object
        res.status(200).json({ status: 'success', message: 'Webhook data received and sent to Discord' });
    } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ status: 'error', message: 'Error processing webhook', error: error.toString() });
  }
  });

//Route to handle incoming webhook data from Noob
app.post('/trades/noob', async (req, res) => {
  try {
    // Log incoming webhook data for debugging
    console.log('Webhook received:', req.body);

    // Retrieve the Discord channel
    const channel = await discordClient.channels.fetch(process.env.NOOB_DISCORD_CHANNEL_ID);

    // Format the message using the formatting function
    const messageContent = formatWebhookData(req.body, false);

    // Send the formatted message to Discord
    await channel.send(messageContent);

    // Respond to the client
  // Respond to the client with a JSON object
      res.status(200).json({ status: 'success', message: 'Webhook data received and sent to Discord' });
  } catch (error) {
  console.error('Error handling webhook:', error);
  res.status(500).json({ status: 'error', message: 'Error processing webhook', error: error.toString() });
}
});

app.get('/health', (req, res) => {
    res.status(200).send('OK');
  });

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});


/* Add Health Checks
You can add a health check in your docker-compose.yml to monitor the application's health:

yaml
Copy code
healthcheck:
  test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
  interval: 30s
  timeout: 10s
  retries: 3
You'll need to implement a /health endpoint in your application for this to work. */