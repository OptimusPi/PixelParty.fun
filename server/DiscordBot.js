// Dependencies
const Discord = require('discord.js');

// Constructor for DiscordClient object
function DiscordBot(config, printMap){
  this.config = config;
  this.connected = false;
  this.printMap = printMap;

  this.init = async function(){
    console.log("Initialiazing Discord Client...");

    this.client = new Discord.Client({intents: 32767 });

    this.client.login(config.token);

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
      if(message.member.roles.cache.some(role => role.name === config.role)){
        if(message.author.bot) return;
        if(message.content == "!pixelparty"){
          message.reply('https://www.pixelparty.fun/');
        }
        else if(message.content === "!screenshot"){
            console.log("Discord Bot heard '!screenshot'");
            let screenshot = printMap();
            message.reply(screenshot);
        }
      }
    });
  }



  this.sendMessage = function(message) {
    if (this.client.connected) {
      this.client.channel.send(message);
    } else {
      console.log("ERROR! Discord bot is not connected..")
    }
  }
}

module.exports = DiscordBot;