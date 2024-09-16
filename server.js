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

// Route to handle incoming webhook data
app.post('/webhook', async (req, res) => {
  try {
    // Log incoming webhook data for debugging
    console.log('Webhook received:', req.body);

    // Retrieve the Discord channel
    const channel = await discordClient.channels.fetch(process.env.DISCORD_CHANNEL_ID);

    // Format and send a message to Discord
    const messageContent = `New webhook data: ${JSON.stringify(req.body)}`;
    await channel.send(messageContent);

    // Respond to the client
    res.status(200).send('Webhook data received and sent to Discord');
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
