// Libraries
require('dotenv').config({path:'server/.env'});
var process = require("process");
const Jimp = require('jimp');
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

const { inherits } = require('util');

var mongoose = require('mongoose');

// Models
const Player = require('./player.js');
const Connection = require('./connection.js');
const MapState = require('./mapState.js');

// Discord bot
const DiscordBot = require('./DiscordBot.js');

// The code in /public is independent from /server
// Use Express to serve everything in the public folder as regular HTML/JavaScript
app.use(express.static(path.join(__dirname, '../public'))) ;

// Serve index.html as plain HTML on GET /
app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

app.get('/screenshot.png', function(req, res) {
  res.set('Cache-Control', 'no-store');
  res.sendFile('screenshot.png', { root: __dirname });
})

app.get('/healthcheck', function (req, res) {
  res.status(200).send({ 
    healthcheck: {
      healthy: true
  }});
});

var mapTiles = new MapState(16, 16);

const mapStateSchema = new mongoose.Schema({
  name: {
      type: String,
      unique: true
  },
  date: Date,
  mapState: Object
});

const MapStateModel = mongoose.model('ColorMapState4', mapStateSchema);

async function saveMap() {
  const dbMapState = await MapStateModel.findOneAndUpdate(
    {
      name: "color-freedraw" // Find by this key
    }, 
    {
      date: Date(), // Update timestamp
      mapState: mapTiles // update map state
    } 
  );
  dbMapState.update();
}

async function ensureMap() {
  console.log('Loading map from mongoDB...');

  await mongoose.connect(process.env.MONGODB_URI);

  const dbMapState = await MapStateModel.findOne({name: "color-freedraw"});
  
  if (dbMapState) {
    console.log("found map state.");
    mapTiles.setTiles(dbMapState.mapState.tiles);
  } else {
    let newMap = new MapStateModel({name: "color-freedraw", date: Date(), mapState: mapTiles });
    newMap.save();
  }
}

ensureMap();

function clearMap() {
  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      const color = 0;
      // Tell every connection the map is clearing
      // Get color of each map tile
      mapTiles[x][y].color = color;

      for (let i = 0; i < connections.length; i++){
        if (connections[i].socket !== null) {
          connections[i].socket.emit('map', {
            x,
            y,
            color
          });
        }
      }
    }
  }
  saveMap();
}

async function screenshotMap(resolution) {
  console.log("screenshotMap()");

	const colors = [
    '#F2F2F2', // White Square 0
		'#383838', // Black Square 1
		'#E81224', // Red Square 2 
		'#F7630C', // Orange Square 3
		'#FFF100', // Yellow Square 4 
		'#16C60C', // Green Square 5
		'#0078D7', // Blue Square 6
		'#886CE4', // Purple Square 7
		'#8E562E', // Brown Square 8
	];

  // reads a plain white png
  const image = await Jimp.read('server/16_16.png');

  // resizes the image to the 
  image.resize(16*resolution, 16*resolution)
    .colorType(6)
    .quality(100);
  
  console.log("Creating png screenshot");

  for (let x = 0; x < 16; x++) {
    for (let y = 0; y < 16; y++) {
      
      // Get color of each map tile
      let color = Jimp.cssColorToHex(colors[mapTiles.get(x, y).color]);
      
      // make bigger pixels for resolution
      // resolution of 1 will only run once and draw one pixel (16x16 image) 
      for (let rx = 0; rx < resolution; rx++) {
        for (let ry = 0; ry < resolution; ry++) {
          image.setPixelColor(color, x*resolution + rx, y*resolution + ry);
        }
      }
    }
  }

  let screenshotHash = image.hash();

  console.log("screenshot writing to screenshot.png");

  try {
    await image.writeAsync('server/screenshot.png');
    console.log("screenshot saved properly!");
  }
  catch (ex) {
    console.log("error saving screenshot: ", ex);
  }

  return {
    screenshotUrl: 'https://www.pixelparty.fun/screenshot.png',
    screenshotHash: screenshotHash
  };
}

function printMap() {
  console.log("printMap()");

  let colors = [
    '⬜', '⬛', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '🟫'
  ];

  let message = '\`\`\`\n';

  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      colorId = mapTiles.getTiles()[x][y].color;
      message += colors[colorId];
    }
    message += '\n';
  }

  message += '\`\`\`';

  console.log("message: ", message);
  return message;
}

// Initialize Discord client and connect
const discordConfig = {
  environment: process.env.ENVIRONMENT,
  token: process.env.DISCORD_TOKEN,
  channel: process.env.DISCORD_CHANNEL,
}

let discordBot = new DiscordBot(discordConfig, 
  () => { return printMap()}, 
  () => {clearMap()}, 
  screenshotMap
);

discordBot.init();

// Server on port 3141 
http.listen(3141, function(){
  console.log('listening on *:3141');
});

// Store all websockets connections
var connections = [];
//increment Connection ID forever until the server turns off! >:)
var connectionID = 0;
function GetConnectionID(){
  connectionID++;
  return connectionID;
}

function removeConnection(id){
  let i;

  for (i = 0; i < connections.length; i++){
    if (connections[i].id === id) {
      console.log('TRACE: Removing connection id:' + i);
      break;
    } else {
      console.log('ERROR: Could not remove ocnnection with id ' + id + ' here because connections[' + i + '].id is: ' + connections[i].id);
    }
  }

  //tell every client to remove connection
  for (var c = 0; c < connections.length; c++) {
    if (connections[c].socket !== null)
      connections[c].socket.emit('logout', connections[i].id);
    else
      console.log('ERROR: cannot remove connection because socket is null for id# ' + connections[c].id);
  }

  //remove connection info from server session.
  if (i != null && i < connections.length){
    connections.splice(i, 1);
  }
  console.log('TRACE: current connections count: ' + connections.length);

}

function changeUsername(id, username)
{
  var playerInfo = new Object();
  var i = 0;
  for (i = 0; i < connections.length; i++){
    if (connections[i].id === id) {
      connections[i].player.name = username;
    }
  }
}

async function actionPlayer(player, action)
{
  if (action === 'place') {

    let x = player.x;
    let y = player.y;
    mapTiles.flip(x, y);
    let color = mapTiles.get(x, y).color;

    console.log(">>> place " + x + "," + y + "(" + color +")");

    for (let i = 0; i < connections.length; i++){
      if (connections[i].socket !== null) {
        connections[i].socket.emit('map', {
          x,
          y,
          color
        });
      }
    }

    saveMap();
  }
}

function movePlayer(id, direction)
{
  var playerInfo = new Object();
  var i = 0;
  for (i = 0; i < connections.length; i++){
    if (connections[i].id === id) {
      if (direction === 'left' && connections[i].player.x > 0){
        connections[i].player.x --;
      }
      if (direction === 'right' && connections[i].player.x < 15){
        connections[i].player.x ++;
      }
      if (direction === 'up' && connections[i].player.y > 0){
        connections[i].player.y --;
      }
      if (direction === 'down' && connections[i].player.y < 15){
        connections[i].player.y ++;
      }
      playerInfo.id = id;
      playerInfo.x = connections[i].player.x;
      playerInfo.y = connections[i].player.y;
    }
  }

  //tell all clients character has moved 
  for (i = 0; i < connections.length; i++){
    if (connections[i].socket !== null) {
      connections[i].socket.emit('move', playerInfo);
    }
  }

}

sendGameChat = function(message) {
  //TODO - make a function to send to all clients
  for (i = 0; i < connections.length; i++){
    if (connections[i].socket !== null) {
      connections[i].socket.emit('chat', message);
    }
  }

  //Send chat to Discord
  discordBot.sendMessage(`<${message.username}> ${message.body}`);
}

function broadcastJoinAll(newPlayerConnectionI)
{
  // Tell everyone about the new player, and tell the new player about everyone.
  for (i = 0; i < connections.length; i++){
    // Broadcast the new player to each existing player.
    connections[i].socket.emit('join', connections[newPlayerConnectionI].player);
  }
}

function broadcastPlayerJoin(id)
{
  //get the index of the new player connection
  var newPlayerConnectionI = connections.length-1;
  var playerInfo = new Object();
  var i = 0;


  // Tell everyone about the new player, and tell the new player about everyone.
  for (i = 0; i < connections.length; i++){
    // Find the new player's connection id
    if (connections[i].id === id) {
      // Broadcast the new player to all existing players.
      broadcastJoinAll(newPlayerConnectionI);
    } else {
      // Broadcast each existing player to the new connection.
      connections[newPlayerConnectionI].socket.emit('join', connections[i].player);
    }
  }
}

io.on('connection', function(socket){
  console.log('someone connected');

  var id = GetConnectionID();
  var player = new Player(id, 'noob', 3, 5);
  var connection = new Connection(id, player, socket);
  connections.push(connection);
  console.log('new connection has joined: ' + connection);
  console.log('connections: ' + connections);

  //Tell the connections that someone connected
  broadcastPlayerJoin(id);

  // Tell the new player the map state
  // TODO - move these
  let width = 16;
  let height = 16;
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      socket.emit('map', {
        x, 
        y, 
        color: mapTiles.get(x, y).color
      });
    }
  }

  socket.on('disconnect', function(){
      console.log('user disconnected');
      removeConnection(id);
  });

  socket.on('move', function(direction){
    //TODO - check collision detection first
    movePlayer(id, direction);
  });

  socket.on('action', async function(action){
    await actionPlayer(player, action);
  });

  socket.on('nick', function(nickname){
    if (typeof(nickname) === "string" && nickname.length < 100) {
      player.name = nickname;
      console.log(`${nickname} has joined Pixel Party!`);
    }
  });
  
  socket.on('chat', function(messageBody){
    var message = {
      username: player.name,
      body: messageBody
    };

    //tell all clients player has spoken
    sendGameChat(message);
  });
});