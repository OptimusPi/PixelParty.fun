// Libraries
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

// Models
const Player = require('./player.js');
const Connection = require('./connection.js');

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

function movePlayer(id, direction)
{
  var playerInfo = new Object();
  var i = 0;
  for (i = 0; i < connections.length; i++){
    if (connections[i].id === id) {
      if (direction === 'left'){
        connections[i].player.x --;
      }
      if (direction === 'right'){
        connections[i].player.x ++;
      }
      if (direction === 'up'){
        connections[i].player.y --;
      }
      if (direction === 'down'){
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

function broadcastPlayerJoin(id)
{
  var playerInfo = new Object();
  var i = 0;
  for (i = 0; i < connections.length; i++){
    if (connections[i].id === id) {
      playerInfo.id = id;
      playerInfo.name = connections[i].player.name;
      playerInfo.x = connections[i].player.x;
      playerInfo.y = connections[i].player.y;

      //Tell this player about all players
      //tell all clients character has moved 
      //TODO - make a function to send to all clients
      for (i2 = 0; i2 < connections.length; i2++){

        //TODO just do a send function instead of checking for socket null
        if (connections[i2].socket !== null && connections[i2].id != id) {
          connections[i2].socket.emit('join', playerInfo);
        }

        //Send this old player's info to new player.
        var existingPlayerInfo = new Object();
        existingPlayerInfo.id = connections[i2].id;
        existingPlayerInfo.name = connections[i2].player.name;
        existingPlayerInfo.x = connections[i2].player.x;
        existingPlayerInfo.y = connections[i2].player.y;
        
        connections[i].socket.emit('join', existingPlayerInfo);
      }
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

  socket.on('disconnect', function(){
      console.log('user disconnected');
      removeConnection(id);
  });

  socket.on('move', function(direction){
    console.log('ID #' + id + ' moved their pixeol.');

    //TODO - check collision detection first
    movePlayer(id, direction);
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

  socket.on('chat', function(messageBody){

    var message = {
      username: player.name,
      body: messageBody
    };

    //tell all clients player has spoken
    sendGameChat(message);
  });
});