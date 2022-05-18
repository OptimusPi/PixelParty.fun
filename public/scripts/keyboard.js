console.log('keyboard.js');

function keyboard(keyCode) {
  var key = {};
  key.code = keyCode;
  key.isDown = false;
  key.isUp = true;
  key.press = undefined;
  key.release = undefined;
  
  //The `downHandler`
  key.downHandler = function(event) {

    //If the user is typing in the chat, do not process key input here.
    if (document.activeElement == document.getElementById('chat-input'))
      return;

    if (event.keyCode === key.code) {
      if (key.isUp && key.press) key.press();
      key.isDown = true;
      key.isUp = false;
    }
  };

  //The `upHandler`
  key.upHandler = function(event) {

    //If the user is typing in the chat, do not process key input here.
    if (document.activeElement == document.getElementById('chat-input'))
      return;

    if (event.keyCode === key.code) {
      if (key.isDown && key.release) key.release();
      key.isDown = false;
      key.isUp = true;
    }
  };

  //Attach event listeners
  document.addEventListener(
    "keydown", key.downHandler.bind(key), true
  );
  document.addEventListener(
    "keyup", key.upHandler.bind(key), true
  );
  return key;
}
