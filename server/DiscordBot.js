// Dependencies
const Discord = require('discord.js');


// Constructor for DiscordClient object
function DiscordBot(config, printMap, clearMap, screenshotMap){
  this.config = config;
  this.connected = false;
  this.printMap = printMap;

  this.init = async function(){
    console.log("Initialiazing Discord Client...");

    this.client = new Discord.Client({intents: 32767 });

    console.log("DiscordBot: this.client.login() with token: ", config.token);
    await this.client.login(config.token);
    console.log("DiscordBot: this.client.login() complete");

    this.client.on('ready', function() {
      console.log("DiscordClient ready");
      let name = "PixelParty.fun";
      let environment = config.environment;
      if (environment !== "production") {
           name += `(${environment})`;
      }

      this.user.setActivity({
          "name": name,
          "type": "PLAYING"
      });

      this.channel = this.channels.cache.get('977799485558251550');
      this.connected = true;

      if (environment === "production") {
        this.channel.send("Pixel Party time :eyes:");
      } else {
        this.channel.send(`Pixel Party time :eyes: environment: ${environment}`);
      }
    });
    
    this.client.on('messageCreate', (message) => {
       // Ignore bot's own messages
        if (message.author.bot) {
          return;
        }

        // Help
        if (message.content == "!pixel help"){
          message.reply('!save\t\t(saves state) \r\n' +
            '!pixel party\t\t(creates a new lobby)\r\n' +
            '!pixel save\t\t(saves a screenshot)\r\n' +
            '!pixel emoji\t\t(https://www.pixelparty.fun/)\r\n' +
            '!pixel wipe\t\t(https://www.pixelparty.fun/)\r\n'
            );
        }
        // Pixel party link
        else if (message.content == "!party"){
          message.reply('https://www.pixelparty.fun/');
        }
        // Emoji-Screenshot sent to discord, and save to mongoDb
        else if(message.content === "!save"){
            let screenshot = printMap();
            message.reply(screenshot);
        }
         // PNG-Screenshot sent to discord, and save to mongoDb
        else if(message.content === "!screenshot"){
          let screenshot = screenshotMap();
          message.reply(screenshot);
        }
        // Clear canvas and start over
        else if(message.content === "!wipe"){
          let screenshot = clearMap();
          message.reply(screenshot);
        }
    });
  }

  this.sendMessage = function(message) {
    if (this.client.connected) {
      this.client.channel.send(message);
    } else {
      console.log("ERROR! Discord bot is not connected...");
    }
  }
}

module.exports = DiscordBot;