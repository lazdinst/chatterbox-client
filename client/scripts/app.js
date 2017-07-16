/* Notes on XSS:

-Convert all inputs to strings

*/

var app = {
  server: 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages?limit=1000000',
  
  currentRoom: $('select').val(),
  
  userLoggedIn: false,
  
  numOfMessages: 0,
  
  init: function() {
    setInterval(this.fetch(), 2000);
    addFriend();
    app.submit();
    this.changeRoomEvent();
  },
  
  
  //============================= AJAX Calls =========================================
  send: function(input) {
    console.log(input);
    $.ajax({
      url: this.server,
      type: 'POST',
      data: input,
      success: postSuccess,
      error: ajaxError(this.type)
    });
  },
  
  submit: function() {
    $(document).on('click', '#submit', function() {
      var message = {
        username: $('#username').val(),
        text: $('#messagetext').val(),
        roomname: currentRoom
      };
      $('#username').hide(); 
      app.userLoggedIn = true;
      $('#messagetext').val('');
      app.send(message);
    });
  },
  
  fetch: function() {
    $.ajax({
      url: this.server,
      type: 'GET',
      success: app.fetchSuccess,
    });
  },
  
  fetchSuccess: function(data) {
    var results = (app.filterData(data));
    
    if ($('#roomSelect').children().length === 0) {
      app.renderRoom(results);
    }
    currentRoom = $('select').val();
    
    results = app.filterByRoom(results, currentRoom);
    if (app.userLoggedIn) {
      console.log(results);
      if (results.length > app.numOfMessages) {
        var populationDifference = results.length - app.numOfMessages;
        for (var i = populationDifference; i > 0; i--) {
          app.renderMessage(results[results.length - i]);
        }
        app.numOfMessages = results.length;  
      }
    } else {
      app.numOfMessages = results.length;
      app.populateRoom(results);
    }
  },
  
  
  //============================= Messaging =========================================
  clearMessages: function() {
    $('#chats').empty(); 
  },
  
  renderMessage: function(input) {
    var username = input.username;
    var message = input.text;
    var dateAndTime = app.formatDate(input.createdAt);
    
    // if (message === 'unsafe') {
    //   message = '<img width="200px" src="https://media.giphy.com/media/3ohzdQ1IynzclJldUQ/giphy.gif" >';
    // }

    message = '<div class="panel panel-default">' + 
                '<div class="panel-heading">' +
                '<h3 class="panel-title text-left"><span class="username">' + 
                username +
                '</span></h3></div><div class="panel-body messagetext text-left">' + message + '</div><div class="panel-footer text-right">' 
                + dateAndTime + '</div></div>';

    $('#chats').prepend(message);
  },
  
  //============================= Rooms =========================================
  renderRoom: function(rooms) {
    // debugger
    var roomSet = new Set();
    rooms.forEach(function(room) {
      roomSet.add(room.roomname);
    });
    roomSet.forEach(function(room) {
      room = '<option>' + room + '</option>';
      $('#roomSelect').append(room);
    });  
  },
  
  changeRoomEvent: function() {
    $(document).on('change', '#roomSelect', function() {
      //remove all teh child nodes
      app.clearMessages();
      app.userLoggedIn = false;
      app.fetch();
      // app.init();
    });
  },
  
  //========================= Filtering Data =============================================
  
  filterByRoom: function(array, room) {
    return array.filter(function(post) {
      return post.roomname === room;
    });
  },
  
  
  filterData: function(data) {
    //remove all posts that are undefined
    var filteredData = _.reject(data.results, function(post) {
      return (post.roomname === undefined) || (post.text === undefined) || (post.username === undefined);
    });
    
    //remove all posts that have invalid roomnames
    filteredData = _.reject(filteredData, function(post) {
      return (post.roomname === null) || (post.roomname.length > 20) || (post.roomname[0] === ' ') || (post.roomname.length < 1);
    });
    
    //remove all posts that have invalid text or '<'
    filteredData = _.reject(filteredData, function(post) {
      return (post.text === null) || (post.text.includes('<'));
    });
    
    //remove all posts that are older than our cohort.
    filteredData = _.reject(filteredData, function(post) {
      return (post.createdAt.slice(0, 10) < '2017-07-03');
    });
    
    //return filteredData;
    return filteredData;
    
    
    // var roomSet = new Set();  
    // var rooms = data.results.filter(function(post) {
    //   return post.hasOwnProperty('roomname');
    // });
    
    // rooms = _.reject(rooms, function(room) {
    //   return (room.roomname === null) || (room.roomname.length > 20) || (room.createdAt.slice(0, 10) < '2017-07-03') || (room.roomname[0] === ' ') || (room.roomname.length < 1); 
    // });
    
    // rooms.forEach(function(room) {
    //   roomSet.add(room.roomname);
    // });
    
    // return roomSet;
  },
  
  //============================= Utilities =========================================
  // Sat Jul 15 2017 12:34:20 GMT-0700 (PDT)
  formatDate: function(date) {
    date = new Date(date).toString();
    var month = date.slice(4, 7);
    var day = date.slice(8, 10);
    var time = date.slice(16, 21);
    return month + ' ' + day + ' ' + time;
  },
  
  populateRoom: function(array) {
    for (var i = 0; i < array.length; i++) {
      app.renderMessage(array[i]);    
    }
  }
};

// var filterRooms = function(data) {
//   var roomSet = new Set();  
//   var rooms = data.results.filter(function(post) {
//     return post.hasOwnProperty('roomname');
//   });
  
//   rooms = _.reject(rooms, function(room) {
//     return (room.roomname === null) || (room.roomname.length > 20) || (room.createdAt.slice(0, 10) < '2017-07-03') || (room.roomname[0] === ' ') || (room.roomname.length < 1); 
//   });
  
//   rooms.forEach(function(room) {
//     roomSet.add(room.roomname);
//   });
  
//   return roomSet;
// };

var postSuccess = function(data) {
  console.log('Sucess!');
  var sucessMessage = '<div class="alert alert-success" role="alert"> You successfully made a post!</div>';
  $('.help-block').append(sucessMessage);
  setTimeout(function() {
    $('.help-block').empty();
  }, 3000);
  app.fetch();
};

var ajaxError = function(type) {
  console.log('ERROR ' + type);
};

// var makeSafe = function(s) {
//   if (s === null || s === undefined) {
//     return s;
//   } else {
//     s = JSON.stringify(s);
//     if (s.includes('<')) {
//       return 'unsafe';
//     }
//     return s;
//   }
// };

var addFriend = function() {
  $(document).on('click', '.username', function() {
    //Select all the span
    var context = this;
    var spans = document.getElementsByTagName('span');
    [...spans].forEach(function(span) {
      if (span.innerHTML === context.innerHTML) {
        if ($(span).hasClass('friend')) {
          $(span).removeClass('friend');
        } else {
          $(span).addClass('friend');
        }
      }
    });
  });
};

$(document).ready(function() {
  app.init();
});








// var fetchSuccess = function(data) {
//   //Add functionality to render rooms for only the room selected / default room
  
//   var results = data.results.filter(function(post) {
//     return post.hasOwnProperty('roomname' && 'text' && 'username');
//   });
  
//   app.renderRoom(filterRooms(data));
//   // debugger
//   currentRoom = $('select').val();
  
//   for (var i = results.length - 1; i >= (results.length - 101); i--) {
//     if (results[i].roomname === 'lobby') {
//       app.renderMessage(results[i]);    
//     }
//   }

// };


    // message = '<div class="mesageBox"><div><span class="username">' + username +
    // '</span></div><div class="messagetext">' + message + '</div><br></div>';
