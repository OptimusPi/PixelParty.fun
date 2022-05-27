// Libraries
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// Models
const Player = require('./player.js');
const Connection = require('./connection.js');
const MapState = require('./mapState.js');

// The code in /public is independent from /server
// Use Express to serve everything in the public folder as regular HTML/JavaScript
app.use(express.static(path.join(__dirname, '../public'))) ;

// Serve index.html as plain HTML on GET /
app.get('/', function(req, res){
  res.sendFile('index.html', { root: __dirname });
});

app.get('/healthcheck', function (req, res) {
  res.status(200).send({ 
    healthcheck: {
      healthy: true
  }});
});

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

var mapTiles = new MapState(16, 16);

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
      console.log('ERROR: cannot remove ocnnection because socket is null for id# ' + connections[c].id);
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

function actionPlayer(player, action)
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

//TODO proper scoping
sendGameChat = function(message) {
  //TODO - make a function to send to all clients
  for (i = 0; i < connections.length; i++){
    if (connections[i].socket !== null) {
      connections[i].socket.emit('chat', message);
    }
  }
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

  socket.on('action', function(action){
    actionPlayer(player, action);
  });

  socket.on('username', function(username){
    // TODO limit chat to (100?) characters
    console.log('ID #' + id + ' changed username to: ' + username);
    var messageBody = player.name + ' is now known as ' + username + '.';
    
    var message = {
      username: 'INFO',
      body: messageBody
    };

    changeUsername(id, username);
    
    //tell all clients player has spoken
    sendGameChat(message);
  });

  socket.on('nick', function(nickname){
    player.name = nickname;
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