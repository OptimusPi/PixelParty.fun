var chat = {
    send: function (messageBody) {
        //Send message to node.js server
        network.emit('chat', messageBody);
    },
    receive: function(message) {
        //Build new chat feed
        var newChatFeed = $('#chat-feed').val();
        newChatFeed += '\r\n';
        newChatFeed += '<' + message.username + '>';
        newChatFeed += ' ';
        newChatFeed += message.body;

        //Update DOM with new chat feed
        $('#chat-feed').val(newChatFeed);
    }
}

$('#chat').submit(function (e) {
    //do not reload the page due to form submission
    e.preventDefault();

    //get chat message the user typed
    var chatMessage = $("#chat-input").val().toString();
    
    //send the chat to the node.js server. There, it will be relayed to IRC if possible
    console.log("Sending chat: " + chatMessage)
    chat.send(chatMessage);

    //Clear the chat input
    $("#chat-input").val("");
});
