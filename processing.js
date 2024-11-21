
const { Client, GatewayIntentBits } = require('discord.js');
require('dotenv').config();

// Set up the Discord bot client
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Login to Discord bot
discordClient.login(process.env.DISCORD_TOKEN);


function format_webhook_data_new(data, suffix) {
  const {
    order_id,
    underlying_symbol,
    order_type,
    status,
    entered_time,
    filled_quantity,
    date,
    strike,
    price,
    put_call,
    instruction,
    account_number,
    gain_loss_percentage,
  } = data;

  //validate that gain loss percentage is not null and if it is then add it to the message as ''
  const gain_loss_string = gain_loss_percentage !== null ? ` ${gain_loss_percentage}%` : '';

    const formattedMessage = `${underlying_symbol} $${strike} ${put_call} ${date} @ $${price}: ${instruction}${gain_loss_string} ${suffix}`;
  
  
    return formattedMessage;
};


/**
 * Process an incoming webhook request.
 * @param {Request} req The incoming request with the webhook data.
 * @param {Response} res The response to send back to the client.
 * @param {string} channelID The ID of the Discord channel to send the message to.
 * @param {string} suffix The suffix to add to the message before sending it to Discord.
 */
async function process_webhook_tracker(req, res, channelID, suffix) {
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
    if (process.env.SEND_TO_DISCORD > 0){
    await channel.send(messageContent);
    }

    // Respond to the client with a JSON object
    res.status(200).json({ status: 'success', message: 'Webhook data received and sent to Discord' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ status: 'error', message: 'Error processing webhook', error: error.toString() });
  }
};



function format_webhook_data_bot(data, suffix) {
  const {
    conditions,
    exchange,
    id,
    price,
    sequence_number,
    sip_timestamp,
    size,
    symbol,
    plain_symbol,
    expirationDate,
    openInterest,
    callPut,
    strike
  } = data;

  //format total price to dollars
  totalPrice = (price * 100) * size;
  //format total price to dollars with commas
  totalPrice = totalPrice.toLocaleString('en-US');
  
  expirationDatestr = formatDate(expirationDate)
  first_part = symbol.slice(0, 1);
  //from the fist part find the end of the symbol within the string
  
  messageContent = `${plain_symbol} $${strike} ${callPut} ${expirationDatestr}\nPrice: $${price} Sizing: ${size} Open interest: ${openInterest}\nTotal Price: $${totalPrice} \n${suffix}` 


  return messageContent;
}

function formatDate(date) {
  //2024-12-27T21:00:00.000+00:00
  //convert above to 12/27/2024

  const dateObj = new Date(date);
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  const year = String(dateObj.getFullYear());

  return `${month}/${day}/${year}`
}

async function process_webhook_unusual_options(req, res, channelID, suffix) {
  try {
    // Log incoming webhook data for debugging
    console.log('Webhook received:', req.body);

    //console.log('Discord Token:', process.env.DISCORD_TOKEN);
    // Retrieve the Discord channel
    const channel = await discordClient.channels.fetch(channelID);

    // Format the message using the formatting function, true stands for @everyone or not
    messageContent = format_webhook_data_bot(req.body, suffix);
    console.log(messageContent)
  //UNCOMMENT FOR PRODUCTION RUNS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Send the formatted message to Discord
    if (process.env.SEND_TO_DISCORD > 0){
      
      await channel.send(messageContent);
    }

    // Respond to the client with a JSON object
    res.status(200).json({ status: 'success', message: 'Webhook data received and sent to Discord' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ status: 'error', message: 'Error processing webhook', error: error.toString() });
  }
};


  module.exports = {
    process_webhook: process_webhook_tracker,
    process_webhook_unusual_options: process_webhook_unusual_options
};