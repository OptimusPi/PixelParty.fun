console.log('network.js');
 
var network =  {
	socket: null,
	emit: function(command, data) {
		this.socket.emit(command, data);
	},
	init: function() {
		//connect to the game server
		this.socket = io();

		this.socket.on('disconnect', function() {
			alert('Somethng went wrong: disconnected. needs to reconnect. Sorry about that. Refresh. Please. I beg you.');
			location.reload();
		});
		
		// player join event
		this.socket.on('join', function(playerInfo){
			graphics.addPlayer(playerInfo);
		});
	
		// player disconnect event
		this.socket.on('logout', function(id){
			//disconnect player from graphics
			graphics.removePlayer(id);
		});
		
		// move event
		this.socket.on('move', function(characterInfo){
			console.log('Character ' + characterInfo.id + ' moved to (' + characterInfo.x + ', ' + characterInfo.y + ').');
			
			//Redraw graphics
			graphics.movePlayer(characterInfo.id, characterInfo.x, characterInfo.y);
		});

		// map action event
		this.socket.on('map', function(mapEvent){
			
			game.flipTile(mapEvent.x, mapEvent.y);

			//Redraw graphics
			graphics.movePlayer(characterInfo.id, characterInfo.x, characterInfo.y);
		});

		// chat event
		this.socket.on('chat', function(message){
			var chatMessage = '<' + message.username + '>' + ' ' + message.body; 
			console.log('Received chat message: ' + chatMessage);
			
			//Update chat window
			chat.receive(message);
		});
	}
};

	