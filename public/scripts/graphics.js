const graphics = {

	screenWidth: 128,
	screenHeight: 128,
	app: {},
	players: [],
	mapTiles: [],
	heart: null,
	colors: ['0xF2F2F2', // White Square 0
		'0X383838', // Black Square 1
		'0XE81224', // Red Square 2 
		'0XF7630C', // Orange Square 3
		'0XFFF100', // Yellow Square 4 
		'0X16C60C', // Green Square 5
		'0X0078D7', // Blue Square 6
		'0X886CE4', // Purple Square 7
		'0X8E562E', // Brown Square 8
	],

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

	addMapTiles: function() {
		//create player base, then add a sprite to it.
		for (let colorId = 0; colorId < 9; colorId++) {
			this.mapTiles[colorId] = [];
			
			for (let x = 0; x < 16; x++){
				this.mapTiles[colorId][x] = [];
				for (let y = 0; y < 16; y++){
					let mapTile = new PIXI.Graphics();
					mapTile.beginFill(this.colors[colorId]);
					mapTile.drawRect(x*8, y*8, 8, 8);
					this.mapTiles[colorId][x][y] = mapTile;

					this.app.stage.addChild(mapTile);
					this.mapTiles[colorId][x][y].visible = colorId === 0;
				}
			}
		}
	},
	flipTile(x, y, color) {
		for (let colorId = 0; colorId < 9; colorId++) {
			// Set the tile's color to visible and all other colors false
			this.mapTiles[colorId][x][y].visible = (color === colorId);
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
		let type = "WebGL";
		if(!PIXI.utils.isWebGLSupported()){
			type = "canvas";
		}
		PIXI.utils.sayHello(type);

		PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
		PIXI.settings.ROUND_PIXELS = true;
		PIXI.settings.RENDER_OPTIONS.antialias = false;
		PIXI.settings.RESOLUTION = 8;

		this.app = new PIXI.Application(this.screenWidth, this.screenHeight, {backgroundColor : 0xFFFFFF, resizeTo: window});
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
				
			})
			.onComplete.add((loader, res) => {
				graphics.init();
			});
	},

	init: function() {
		//Start the game!
		//TODO add networking init to game.init
		this.addMapTiles();


		// Menu //
		//
		// Choose nickname
		let input = new PIXI.TextInput({
			input: {
				fontStyle: 'normal',
				fontFamily: 'monospace',
				textAlign: 'center',
				fontSize: '8px',
				width: '96px',
				height: '16px',
				color: '#26272E',
			},
			box: {
				default: {fill: 0xE8E9F3, rounded: 0, stroke: {color: 0xCBCEE0, width: 1}},
				focused: {fill: 0xE1E3EE, rounded: 0, stroke: {color: 0xABAFC6, width: 1}},
				disabled: {fill: 0xDBDBDB, rounded: 0}
			},
		})

		input.placeholder = 'my name is...'
		input.x = 64
		input.y = 64
		input.pivot.x = input.width/2
		input.pivot.y = input.height/2

		this.addMapTiles();
		this.app.stage.addChild(input);



		game.getNickname(input);
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