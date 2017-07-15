/* Notes on XSS:

-Convert all inputs to strings

*/
var app = {
  server: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages',
  
  currentRoom: 'lobby',
  
  init: function() {
    this.fetch();
  },
  
  send: function(input) { //Expecting AJAX Post requst
    var data = JSON.stringify(input);
    $.ajax({
      url: this.server,
      type: 'POST',
      data: data,
      success: postSuccess,
      error: ajaxError(this.type)
    });
  
  },
  
  fetch: function() { //Expecting GET request
    $.ajax({
      url: this.server,
      type: 'GET',
      success: fetchSuccess,
      error: ajaxError(this.type)
      // dataType: json
    });
  },
  
  clearMessages: function() {
    $('#chats').children().remove();
  },
  
  renderMessage: function(input) {
    var username = makeSafe(input.username);
    var message = makeSafe(input.text);
    message = '<div class="mesageBox"><div class="username">' + username +
    '</div><div class="messagetext">' + message + '</div><br></div>';
    $('#chats').append(message);
  },
  
  renderRoom: function(input) {
    var room = makeSafe(input);
    room = '<a href="' + room + '">' + room + '</a>';
    $('#roomSelect').append(room);
  },
  
  handleUsernameClick: function(username) {
    // $('')
  }
};

$(document).ready(function() {
  app.init();
});

// $.get(domian, function(data) {
//   console.log(data);
// });

var fetchSuccess = function(data) {
  console.log(data);
  data.results.forEach(function(messageObject) {
    app.renderMessage(messageObject);
  });
};

var postSuccess = function(data) {
  //something here
};

var ajaxError = function(type) {
  //throw new Error('AJAX Error: Cannot perform ' + type + ' action');
  console.log('ERROR ' + type);
};

var makeSafe = function(s) {
  if (!null) {
    s = JSON.stringify(s);
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
  }
  return s;
};