const graphics = {

	screenWidth: 128,
	screenHeight: 128,
	app: {},
	players: [],
	heart: null,

	removePlayer: function(id) {
		var i;
	
		for (i = 0; i < this.players.length; i++){
			if (this.players[i].id === id) 
				break;
		}
		if (i != null && i < this.players.length){
			this.app.stage.removeChild(this.players[i].sprite);
			this.players.splice(i, 1);
		}
	},

	addPlayer: function(playerInfo) {

		//create player base, then add a sprite to it.
		var player = new Player(playerInfo.id, playerInfo.x, playerInfo.y);

		// create new sprite TOO make it from the image textures loaded in
		var playerSprite = new PIXI.Sprite(this.heart.texture);
		playerSprite.x = playerInfo.x * 8;
		playerSprite.y = playerInfo.y * 8;
		
		//add sprite to player
		player.sprite = playerSprite;

		//add sprite to the screen.
		this.app.stage.addChild(player.sprite);

		//finally, add player to collection of all players logged in to the game.
		this.players.push(player);
	},

	setPlayerSprite: function(player, newSprite){
		player.sprite.texture = newSprite.texture;
	},

	movePlayer: function(id, x, y) {
		for (var i = 0; i < this.players.length; i++){
			if (this.players[i].id === id){
				//move the character on screen
				this.players[i].sprite.x = x * 8;
				this.players[i].sprite.y = y * 8;
			}
		}
	},

	start: function(){
		var type = "WebGL";
		if(!PIXI.utils.isWebGLSupported()){
			type = "canvas";
		}
		PIXI.utils.sayHello(type);

		PIXI.settings.ROUND_PIXELS = true;

		this.app = new PIXI.Application(this.screenWidth, this.screenHeight, {backgroundColor : this.backgroundColor, resizeTo: window});
		graphics.app.renderer.view.style.width = '512px';
		graphics.app.renderer.view.style.height = '512px';

		var canvas = document.getElementById('canvas');
		canvas.appendChild(this.app.view);

		PIXI.loader
			.add({name: 'apple', url: 'images/apple.png'})
			.add({name: 'banana', url: 'images/banana.png'})
			.add({name: 'carrot', url: 'images/carrot.png'})
			.add({name: 'cat', url: 'images/cat.png'})
			.add({name: 'cherries', url: 'images/cherries.png'})
			.add({name: 'diamond', url: 'images/diamond.png'})
			.add({name: 'dog', url: 'images/dog.png'})
			.add({name: 'face', url: 'images/face.png'})
			.add({name: 'heart', url: 'images/heart.png'})
			.add({name: 'pi', url: 'images/pi.png'})
			.add({name: 'skull', url: 'images/smile.png'})
			.add({name: 'sword', url: 'images/sword.png'})
			.load(function (){
				//map layers
				graphics.heart = new PIXI.Sprite(PIXI.loader.resources.heart.texture);
				graphics.init();
			});
	},

	init: function() {
		//Start the game!
		//TODO add networking init to game.init
		game.init();
	}
};

var layout = {    
   ratio: graphics.screenWidth/graphics.screenHeight,
			   
   addListeners: function(){
	//    //Scale game to fit perfectly as the user resies their browser window
	//    $(window).resize(function(){
	// 	   layout.resizeCanvas();
	//    });
	   
	//    //Resize when a mobile devices switches between portrait and landscape orientation
	//    $(window).on( "orientationchange", function(){
	// 	   layout.resizeCanvas();
	//    });
   }
};

graphics.start();