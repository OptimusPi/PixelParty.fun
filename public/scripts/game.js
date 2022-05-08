console.log('game.js');
  
var game = {
  //keyboard arrow keys
  left: keyboard(37),
  up: keyboard(38),
  right: keyboard(39),
  down: keyboard(40),

  //Functions
  playSound: function(sound){
    PIXI.sound.play(sound);
  },
  stopSound: function(sound){
    PIXI.sound.play(sound);
  },
  runMenu: function(){
    graphics.runMenu();
    game.playSound('menu');
  },
  runOverworld: function(){
    graphics.runOverworld();
    game.playSound('game');
  },
  movePlayerLeft: function(){
    network.emit('move', 'left');
  },
  movePlayerRight: function(){
    network.emit('move', 'right');
  },
  movePlayerUp: function(){
    network.emit('move', 'up');
  },
  movePlayerDown: function(){
    network.emit('move', 'down');
  },
  init: function(){
    //Left arrow key press method
    this.left.press = function() {
    
      //send move left action
      game.movePlayerLeft();
      console.log('I pressed left.');
    };
    
    //Right arrow key press method
    this.right.press = function() {
  
      //send move right action
      game.movePlayerRight();
      console.log('I pressed right.');
    };
    
    //Up arrow key press method
    this.up.press = function() {
  
      //send move up action
      game.movePlayerUp();
      console.log('I pressed up.');
    };
    
    //Down arrow key press method
    this.down.press = function() {
        //send move down action
        game.movePlayerDown();
        console.log('I pressed down.');
    };

    //Game music
    var gameSound = 
    PIXI.sound.add('game', {
        url: 'sounds/game.ogg', 
        loop: true
    });
    //Menu music
    PIXI.sound.add('menu', {
        url: 'sounds/menu.ogg',
        loop: true
    });

    //Connect to game server
    network.init();
  }
}


