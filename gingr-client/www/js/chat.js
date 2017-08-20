//initialize
//var myApp = new Framework7();

//custom DOM
//var $$ = Dom7;

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {

	//wait for matches page to be fully loaded
	myApp.onPageInit('matches'), function(page) {
		console.log("chat init");
		getMatches();

	}






	// wait for conversation page to be fully loaded
	myApp.onPageInit('conversation', function(page) {

		console.log("conversation init");

		// new conversation flag off
		var conversationStarted = false;
		
		// init messages and messagebar
		var myMessages = myApp.messages('.messages', {
		 	autoLayout:true
		});
		var myMessagebar = myApp.messagebar('.messagebar');


		//get name and avatar from other user from db



		// on touch of "send" button - sendMessage
		$("#link").on('touchend', function(e) {
			sendMessage();
			e.preventDefault();
			console.log("send clicked");
		}); 
	});
});

//get list of all matches for user
function getMatches() {

	//get email from local stroage
	userID = localStorage.id;

	//make data string
	var dataString = {id: userID};

	//ajax post to get user id from email
	$.ajax({
		type: "POST",
		url: "http://gingr-server.com/matches.php",
		data: dataString,
		dataType: 'JSON',
		crossDomain: true,
		cache: false,

		beforeSend: function() {
			console.log("connecting to server");
		},

		//display success/fail message - put something in data on server
		success: function(data, textString, xhr) {
			if (data.status == "complete") {
				
				} else {
				myApp.alert("Unknown error, please try again", "Action Failed");
			}
		},

		error: function(xhr, ajaxOptions, errorThrown) {
			console.log(xhr);
			console.log(errorThrown);
			myApp.alert("Unknown error, please try again", "Action Failed");
		},

		complete: function(data) {
			if (data.readyState == "0") {
				console.log("unsent");
			} else if (data.readyState == "4") {
				console.log("done");
			}	
		}
	});
}

//send a new message to target
function sendMessage() {
  	// get message bar content
 	var messageText = myMessagebar.value().trim();

	// exit if empty message
	if (messageText.length === 0)
		return;
 
	// clear messagebar
	myMessagebar.clear()
 
	// Random message type - DEBUGGING
	var messageType = (['sent', 'received'])[Math.round(Math.random())];
 
	// Avatar and name for received message
	var avatar, name;
	if (messageType === 'received') {
		//get avatar from other user's profile
		avatar = '';
		name = 'Kate';
	}
	// Add message
	myMessages.addMessage({
		// message data
		text: messageText,
		type: messageType,
		avatar: avatar,
		name: name,
		// date and time
		day: !conversationStarted ? 'Today' : false,
		time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
  			})
 
	// Update conversation flag
	conversationStarted = true;
}     