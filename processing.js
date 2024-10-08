
const { Client, GatewayIntentBits } = require('discord.js');

// Set up the Discord bot client
const discordClient = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// Login to Discord bot
discordClient.login(process.env.DISCORD_TOKEN);


function format_webhook_data_new(data, suffix) {


    //calculate Sign scale rounding up
    let signScale = calculate_sign_scale(data.executionSignScale) 
    
    //calulate execution Price
    let execution = calculate_execution(signScale, data.executionPrice)

    //format date
    let date = format_date(data.shortDescriptionText)

    //format strike price
    let strike = format_strike(data.shortDescriptionText)

    //format Call/ Put
    let callPut = format_call_put(data.shortDescriptionText)

    //optional formatting for calcualting BTO or STO
    let postionCode = calculate_position(callPut, data.buySellCode)

    //get the underLyingSymbol
    let symbol = data.underlyingSymbol

    // Assemble the message
    const formattedMessage = `${symbol} $${strike} ${callPut} ${date} @ $${execution}: ${postionCode} ${suffix}`;
  
    //console.log('Formatted Message:', formattedMessage); // For debugging
  
    return formattedMessage;
};

function calculate_sign_scale(signScale){
  signScale = Math.ceil(signScale/2)
  //console.log(signScale)
  return (Math.pow(10, signScale))
};

function calculate_execution(signScale, executionIN){
  let loValue = parseInt(executionIN.lo)
  let executionOut = (loValue/ signScale)
  return executionOut.toFixed(2)
};

function format_date(shortDescriptionIN){
  let date = shortDescriptionIN.replace(/.*?(\d{2}\/\d{2}\/\d{4}).*/, '$1');
  //console.log(date); // Output: "10/11/2024 $120 Call"
  return date
};

function format_strike(shortDescriptionIN){
  let strike = shortDescriptionIN.replace(/.*?(\d{2}\/\d{2}\/\d{4})\s+\$(\d+).*/, '$2');
  //console.log(strike); // Output: "120"
  return strike
};

function format_call_put(shortDescriptionIN) {
  // Modify the regex to capture the Call or Put part
  let callPut = shortDescriptionIN.replace(/.*?(\d{2}\/\d{2}\/\d{4})\s+\$(\d+)\s+(\w+).*/, '$3');
  console.log(callPut); // Output: "Call" or "Put"
  return callPut;
}


function calculate_position(callPut, buySell){
  console.log(callPut)
  console.log(buySell)
  if(callPut == "Call"){
    if(buySell == "Buy"){
      return "BTO"
    }
    else if(buySell == "Sell"){
      return "Closing Positon"
    }
  }
  else if(callPut == "Put"){
    if(buySell == "Buy"){
      return "STO"
    }
    else if(buySell == "Sell"){
      return "Closing Positon"
    }
  }
};

async function process_webhook_new(req, res, channelID, suffix) {
  try {
    // Log incoming webhook data for debugging
    console.log('Webhook received:', req.body);

    // Retrieve the Discord channel
    const channel = await discordClient.channels.fetch(channelID);

    // Format the message using the formatting function, true stands for @everyone or not
    const messageContent = format_webhook_data_new(req.body, suffix);
    console.log(messageContent)
  //UNCOMMENT FOR PRODUCTION RUNS!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    // Send the formatted message to Discord
    //await channel.send(messageContent);

    // Respond to the client
  // Respond to the client with a JSON object
      res.status(200).json({ status: 'success', message: 'Webhook data received and sent to Discord' });
  } catch (error) {
  console.error('Error handling webhook:', error);
  res.status(500).json({ status: 'error', message: 'Error processing webhook', error: error.toString() });
  }
};

  module.exports = {
    formatWebhookData: format_webhook_data, process_webhook, process_webhook_new, format_webhook_data_new
};