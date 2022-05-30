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
        this.channel.send(":art: Pixel Party time :eyes:");
      } else {
        this.channel.send(`:art: Pixel Party time :eyes: environment: ${environment}`);
      }
    });
    
    this.client.on('messageCreate', (message) => {
       // Ignore bot's own messages
        if (message.author.bot || !message.content.startsWith("!pixel")) {
          return;
        }

        // Help
        if (message.content == "!pixel help"){
          message.reply(
            '!pixel party\t(creates a new lobby)\r\n' +
            '!pixel print\t(Send game state with emoji codeblock)\r\n' +
            '!pixel screenshot {scale}\t(Take a screenshot, scale 1=16px, scale 2=32px, etc.)\r\n' +
            '!pixel wipe\t(clear the current state)'
            );
        }
        // Pixel party link
        else if (message.content === "!pixel party"){
          message.reply('https://www.pixelparty.fun/');
        }
        // Emoji-Screenshot sent to discord, and save to mongoDb
        else if(message.content === "!pixel print"){
            let screenshot = printMap();
            message.reply(screenshot);
        }
         // PNG-Screenshot sent to discord, and save to mongoDb
        else if(message.content.startsWith("!pixel screenshot")){
          let args = message.content.split(" ");

          try {
            let resolution = parseInt(args[args.length - 1]);
            console.log("resolution: ", resolution);
            let screenshot = screenshotMap(resolution);
            //message.reply(screenshot);

            message.reply("PixelParty.fun Screenshot", {
              files: ['https://www.pixelparty.fun/screenshot.png']
            });
          } catch (ex) {
            message.reply("usage \`!pixel screenshot 8\`");
          }
          
        }
        // Clear canvas and start over
        else if(message.content === "!pixel wipe"){
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