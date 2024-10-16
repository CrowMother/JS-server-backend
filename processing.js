
const { Client, GatewayIntentBits } = require('discord.js');

// Set up the Discord bot client
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Login to Discord bot
discordClient.login(process.env.DISCORD_TOKEN);


function format_webhook_data_new(data, suffix) {


    const formattedMessage = `${data.message} ${suffix}`;
  
  
    return formattedMessage;
};


/**
 * Process an incoming webhook request.
 * @param {Request} req The incoming request with the webhook data.
 * @param {Response} res The response to send back to the client.
 * @param {string} channelID The ID of the Discord channel to send the message to.
 * @param {string} suffix The suffix to add to the message before sending it to Discord.
 */
async function process_webhook(req, res, channelID, suffix) {
  try {
    // Log incoming webhook data for debugging
    console.log('Webhook received:', req.body);

    //console.log('Discord Token:', process.env.DISCORD_TOKEN);
    // Retrieve the Discord channel
    const channel = await discordClient.channels.fetch(channelID);

    // Format the message using the formatting function, true stands for @everyone or not
    const messageContent = format_webhook_data_new(req.body, suffix);
    console.log(messageContent)
  //UNCOMMENT FOR PRODUCTION RUNS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Send the formatted message to Discord
    await channel.send(messageContent);

    // Respond to the client with a JSON object
    res.status(200).json({ status: 'success', message: 'Webhook data received and sent to Discord' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ status: 'error', message: 'Error processing webhook', error: error.toString() });
  }
};

  module.exports = {
    process_webhook
};