
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
    quantity_string
  } = data;

  //validate that gain loss percentage is not null and if it is then add it to the message as ''
  const gain_loss_string = gain_loss_percentage !== null ? ` ${gain_loss_percentage}%` : '';

  //validate that if the quantity null or undefined then add it to the message as ''
  console.log(quantity_string)

    const formattedMessage = (`${underlying_symbol} $${strike} ${put_call} ${date} @ $${price}: ${instruction} ${gain_loss_string}
    ${suffix}`);
  
  
    return formattedMessage;
};


/**
 * Process an incoming webhook request.
 * @param {Request} req The incoming request with the webhook data.
 * @param {Response} res The response to send back to the client.
 * @param {string} channelID The ID of the Discord channel to send the message to.
 * @param {string} suffix The suffix to add to the message before sending it to Discord.
 */
async function process_webhook_tracker(req, res) {
  try {
    // Log incoming webhook data for debugging
    console.log('Webhook received:', req.body);

    //process message into discord channel id, message content from the request body
    channelID = req.body.channel;
    console.log(channelID)
    message = req.body.content;
    const channel = await discordClient.channels.fetch(channelID);

    //UNCOMMENT FOR PRODUCTION RUNS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Send the formatted message to Discord

    const roleId = req.body.role; // your role ID
    console.log(`role id ${req.body.role}`)
    await channel.send({
      content: `${message}\n<@&${roleId}> `,
      allowedMentions: { roles: [roleId] } // explicitly allow pinging that role
    });


    // Respond to the client with a JSON object
    res.status(200).json({ status: 'success', message: 'Webhook data received and sent to Discord' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ status: 'error', message: 'Error processing webhook', error: error.toString() });
  }
};

function format_date(symbol) {
  const match = symbol.match(/\d{6}/);
  if (match) {
    const year = match[0].slice(0, 2);
    const month = match[0].slice(2, 4);
    const day = match[0].slice(4, 6);
    return `${month}/${day}/${year}`
  }
}

function format_call_put(symbol) {
  const match = symbol.match(/[CP]/);
  console.log(match)
  if (match) {
    if (match[0] === 'C') {
      return 'C'
    } 
    else if (match[0] === 'P') {
      return 'P'
    }
    else {
      return match
    }
  }
}

function format_strike_price(symbol) {
  // Match the numeric digits immediately after 'C' or 'P'
  const match = symbol.match(/[CP](\d+)/);

  if (match && match[1]) {
    // Divide by 1000 and format to 2 decimal places
    return (parseInt(match[1], 10) / 1000).toFixed(2);
  } else {
    throw new Error("Invalid options contract format: C or P not found");
  }
}

function format_webhook_data_bot(data) {
  const {
    price,
    size,
    timestamp,
    symbol,
    openInterest,
    fullSymbol
  } = data;

  function format_total_price(price, size) {
    //add commas to the price
    total = (price * size) * 100
    const formattedPrice = total.toLocaleString('en-US');
    return `${formattedPrice}`
  }

  // message = (`${size} contracts of ${symbol} $${format_strike_price(fullSymbol)}${format_call_put(fullSymbol)} ${format_date(fullSymbol)}  @ $${price}\nover\n${openInterest} open interest : Totaling $${format_total_price(price, size)} ${suffix}`);
  message = (`### ${symbol} $${format_strike_price(fullSymbol)}${format_call_put(fullSymbol)} ${format_date(fullSymbol)} @ $${price} \n${size} contracts Totaling: $${format_total_price(price, size)}\nOpen Interest: ${openInterest}`);

  console.log(message)
  return message
}

async function process_webhook_unusual_options(req, res, channelID, suffix) {
  try {
    console.log('Webhook received:', req.body);
    //process into discord message
    const channel = await discordClient.channels.fetch(channelID);

    message = format_webhook_data_bot(req.body, suffix);
    //UNCOMMENT FOR PRODUCTION RUNS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Send the formatted message to Discord
    if (process.env.SEND_TO_DISCORD > 0){
    await channel.send({
      content: `<@&${suffix}> Hello role!`,
      allowedMentions: {roles: [suffix]}
    });
    }


    res.status(200).json({ status: 'success', message: 'Webhook data received' });
  } catch (error) {
    console.error('Error handling webhook:', error);
    res.status(500).json({ status: 'error', message: 'Error processing webhook', error: error.toString() });
  }
}


  module.exports = {
    process_webhook: process_webhook_tracker,
    process_webhook_unusual_options: process_webhook_unusual_options
};