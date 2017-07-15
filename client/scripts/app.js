/* Notes on XSS:

-Convert all inputs to strings

*/

var i = 0; 

var app = {

  server: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages?limit=1000000',
  
  currentRoom: 'lobby',
  
  init: function() {
    this.fetch();
    
    $(document).on('click', '.username', function() {
      
    });
  },
  
  send: function(input) { //Expecting AJAX Post requst
    $.ajax({
      url: this.server,
      type: 'POST',
      data: input,
      success: postSuccess,
      error: ajaxError(this.type)
    });
  
  },
  
  fetch: function() { //Expecting GET request
    $.ajax({
      url: this.server + '',
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
  
};

$(document).ready(function() {
  app.init();
});

// $.get(domian, function(data) {
//   console.log(data);
// });

var fetchSuccess = function(data) {
  console.log(data);
  
  var results = data.results.filter(function(post) {
    return post.hasOwnProperty('roomname' && 'text' && 'username');
  });
  results.forEach(function(messageObject) {
    app.renderMessage(messageObject);
  });
};

var postSuccess = function(data) {
  console.log('Sucess!');
};

var ajaxError = function(type) {
  //throw new Error('AJAX Error: Cannot perform ' + type + ' action');
  console.log('ERROR ' + type);
};

var makeSafe = function(s) {
  if (s === null || s === undefined) {
    return s;
  } else {
    s = JSON.stringify(s);
    if (s.includes('<')) {
      return 'no no';
    }
    return s;
  }

};