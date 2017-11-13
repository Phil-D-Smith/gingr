//initialize
//var myApp = new Framework7();

//custom DOM
//var $$ = Dom7;

//interval for checking messages
var checkInterval = 3000;
var currentPage = 0;

//handle Cordova device ready event
$$(document).on('deviceready', function() {

	//wait for matches page to be fully loaded
	myApp.onPageInit('matches', function(page) {
		console.log("matches init");
		//get all matches (and new messages etc)
		getMatches();
		console.log("all matches loaded");

		//on touch of a match, load those messages
		$(document).on("touchend", ".match", function(e) {
			e.preventDefault();
			console.log("match clicked");
			//get match ID from html element after templated
			var matchID = $(this).data("match-id");
			var matchName = $(this).data("first-name");
			//store match ID locally to load correct messages in next page
			localStorage.matchID = matchID;
			localStorage.matchName = matchName;

			mainView.router.loadPage("conversation.html");
		}); 
	});

	//wait for conversation page to be fully loaded
	myApp.onPageInit('conversation', function(page) {
		console.log("conversation init");
		currentPage = "conversation";
		//get match ID passed through browser storage
		var matchID = localStorage.matchID;
		var matchName = localStorage.matchName;
		var userID = localStorage.id;
		//get all messages for that match
		getMessages(matchID, matchName, userID);

		//on touch of "send" button - sendMessage
		$("#link").on('touchend', function(e) {
			e.preventDefault();
			//get match ID passed through browser storage
			var matchID = localStorage.matchID;
			var userID = localStorage.id;
			//send message from userID
			sendMessage(matchID, userID);

			//clear match ID so it doesn't mess stuff up
			//var matchID = 0;

			console.log("send clicked");
		}); 
	});

	//some mad ajax polling to periodically check messages - vary by inactivity
	setInterval(checkMessages, checkInterval);
	//define inactivity as - no messages sent/recieved for set time / conversation not open / not on app

});


//get list of all matches for user
function getMatches() {

	//get email from local stroage
	var userID = localStorage.id;
	console.log(userID);

	//make data string
	var dataString = {"action": "getMatches", "id": userID};
	console.log(dataString);

	//ajax post to get user id from email
	$.ajax({
		type: "POST",
		url: server + "/matches.php",
		data: dataString,
		dataType: 'json',
		crossDomain: true,
		cache: false,

		beforeSend: function() {
			console.log("connecting to server");
		},

		//display success/fail message - put something in data on server
		success: function(data, textString, xhr) {
			if (data.status == "success") {
				//loop through matched user data and populate list
				for (i = 0; i < data.numMatches; i++) {
					//get into local variables for readability
					var matchID = data.users[i]["matchID"];
					var firstName = data.users[i]["firstName"];
					var lastName = data.users[i]["lastName"];
					var dateTime = data.users[i]["dateTime"];
					var lastMessage = data.users[i]["lastMessage"];
					//get into js date object
					var dateObj = new Date(dateTime);
					var hours = ('0' + dateObj.getHours()).slice(-2);
					var minutes = ('0' + dateObj.getMinutes()).slice(-2);

					//need to filter so if date was yesterday, shows date

					//template engine to replace this
					var $matchItem = $(	"<li>" +
										"<a data-match-id=" + matchID + " data-first-name=" + firstName + " class='match item-link item-content item-content-matches'>" +
											"<div class='item-media'><img src=" + "media/ginger_kitten.jpg" + " width='50'></div>" +
											"<div class='item-inner'>" +
												"<div class='item-title-row'>" +
													"<div class='item-title item-title-matches'>" + firstName + "</div>" + 
													"<div class='item-after'>" + hours + ":" + minutes + "</div>" + 
												"</div>" +
												"<div class='item-text'>" + lastMessage + "</div>" +
											"</div>" +
										"</a>" +
										"</li>"	);


					$(".match-list").append($matchItem);
				}


			} else if (data.status == "error") {
				myApp.alert("Unknown error 01, please try again", "Action Failed");
			}
		},

		error: function(xhr, ajaxOptions, errorThrown) {
			console.log(xhr);
			console.log(errorThrown);
			myApp.alert("Unknown error 02, please try again", "Action Failed");
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
function sendMessage(matchID, userID) {

	// new conversation flag off
	var	conversationStarted = false;	
	// init messages and messagebar - get content
	var	myMessages = myApp.messages('.messages', {
		 autoLayout:true
	});
	var	myMessagebar = myApp.messagebar('.messagebar');
 	var messageText = myMessagebar.value().trim();
	// exit if empty message
	if (messageText.length === 0)
		return;
	// clear messagebar
	myMessagebar.clear()

	//get messages here

	//post request string to server
	var dataString = {"action": "sendMessage", "matchID": matchID, "senderID": userID, "messageBody": messageText};

	//ajax post to get user id from email
	$.ajax({
		type: "POST",
		url: server + "/chat.php",
		data: dataString,
		dataType: 'json',
		crossDomain: true,
		cache: false,

		beforeSend: function() {
			console.log("connecting to server");
		},

		//display success/fail message - put something in data on server
		success: function(data, textString, xhr) {
			if (data.status == "success") {
				console.log("message uploaded to server")
				localStorage.messageCount = data.messageCount;


			} else if (data.status =="empty") {
				//if no messages, new match
				console.log("no messages");

			} else if (data.status == "error") {
				myApp.alert("Unknown error 03, please try again", "Action Failed");
			}
		},

		error: function(xhr, ajaxOptions, errorThrown) {
			console.log(xhr);
			console.log(errorThrown);
			myApp.alert("Unknown error 02, please try again", "Action Failed");
		},

		complete: function(data) {
			if (data.readyState == "0") {
				console.log("unsent");
			} else if (data.readyState == "4") {
				console.log("done");
			}	
		}
	});

	//name and avatar
	var messageType = 'sent';

	var avatar = '';
	var name = 'Me';

	// Add message
	myMessages.addMessage({
		// message data
		text: messageText,
		type: messageType,
		avatar: avatar,
		//name: name,
		// date and time
		day: !conversationStarted ? 'Today' : false,
		time: !conversationStarted ? (new Date()).getHours() + ':' + (new Date()).getMinutes() : false
  			})
 
	// Update conversation flag
	conversationStarted = true;
}     

//get message string from db for target
function getMessages(matchID, matchName, userID) {
	// new conversation flag off
	console.log(userID);
	console.log(matchID);
	console.log(matchName);
	var	conversationStarted = false;	

	// init messages and messagebar globally
	var	myMessages = myApp.messages('.messages', {
		 autoLayout:true
	});
	var	myMessagebar = myApp.messagebar('.messagebar');

	//get messages here
	//make data string
	var dataString = {"action": "getMessages", "userID": userID, "matchID": matchID};
	console.log(dataString);

	//ajax post to get user id from email
	$.ajax({
		type: "POST",
		url: server + "/chat.php",
		data: dataString,
		dataType: 'json',
		crossDomain: true,
		cache: false,

		beforeSend: function() {
			console.log("connecting to server");
		},

		//display success/fail message - put something in data on server
		success: function(data, textString, xhr) {
			if (data.status == "success") {
				//loop through matched user data and populate list
				for (i = 0; i < data.messageCount; i++) {
					//get into local variables for readability
					var dateTime = data.messages[i]["dateTime"];
					var messageNumber = data.messages[i]["messageNumber"];
					var messageBody = data.messages[i]["messageBody"];
					var senderID = data.messages[i]["senderID"];
					//conver to js date object
					var dateObj = new Date(dateTime);
					var minutes = ('0' + dateObj.getMinutes()).slice(-2);
					var hours = ('0' + dateObj.getHours()).slice(-2);
					var day = ('0' + dateObj.getDate()).slice(-2);
					var month = ('0' + (dateObj.getMonth()+1)).slice(-2);
					var year = ('0' + dateObj.getYear()).slice(-2);

					//get avatar in blob format
					var avatar = ""; //god knows how to get photos
					var firstName;
					//if "from" = logged in user, message type = sent, else recieved
					
					if (senderID == localStorage.id) {
						var messageType = "sent";
						firstName = "Me";
					} else {
						var messageType = "received";
						//avatar and name for received message
						avatar = '';
						firstName = matchName;
					}
				
					//add message
					myMessages.addMessage({
						//message data
						text: messageBody,
						type: messageType,
						avatar: avatar,
						//name: firstName,
						//date and time
						//if conversation is not started: "today", else: false (no day) 
						day: !conversationStarted ? day + '/' + month + '/' + year : false,
						time: !conversationStarted ? ' ' + hours + ':' + minutes : false
  					})
 
					//update conversation flag
					conversationStarted = true;

				}

			} else if (data.status =="empty") {
				//if no messages, new match
				console.log("no messages");
				var a = 0;

			} else if (data.status == "error") {
				myApp.alert("Unknown error 05, please try again", "Action Failed");
			}
		},

		error: function(xhr, ajaxOptions, errorThrown) {
			console.log(xhr);
			console.log(errorThrown);
			myApp.alert("Unknown error 02, please try again", "Action Failed");
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

//get message string from db for target
function checkMessages() {
	var originUserID = localStorage.id;
	var	conversationStarted = false;	

	//make data string
	var dataString = {"action": "checkMessages", "originID": originUserID, "currentPage": currentPage, "matchID": localStorage.matchID};
	console.log(dataString);

	//ajax post to get user id from email
	if (originUserID) {
		$.ajax({
			type: "POST",
			url: server + "/chat.php",
			data: dataString,
			dataType: 'json',
			crossDomain: true,
			cache: false,

			beforeSend: function() {

			},

			//display success/fail message - put something in data on server
			success: function(data, textString, xhr) {
				if (data.status == "success") {
					//if new messages - loop through matched user data and populate list
					if (data.newMessages) {
						console.log(data.newMessages + " new message threads avaliable");
						//if the conversation page is loaded
						if (currentPage == "conversation") {
							matchID = localStorage.matchID;
							//then load the new messages for that match
							for (i = 0; i < (data.messages[matchID][0]["currentMessageCount"] - data.messages[matchID][0]["lastMessageCount"]); i++) {
								console.log("sorting out new message");
								//get into local variables for readability
								var dateTime = data.messages[matchID][i]["dateTime"];
								var messageNumber = data.messages[matchID][i]["messageNumber"];
								var messageBody = data.messages[matchID][i]["messageBody"];
								var senderID = data.messages[matchID][i]["senderID"];
								//conver to js date object
								var dateObj = new Date(dateTime);
								var minutes = ('0' + dateObj.getMinutes()).slice(-2);
								var hours = ('0' + dateObj.getHours()).slice(-2);
								var day = ('0' + dateObj.getDate()).slice(-2);
								var month = ('0' + (dateObj.getMonth()+1)).slice(-2);
								var year = ('0' + dateObj.getYear()).slice(-2);

								//get avatar in blob format
								var avatar = ""; //god knows how to get photos
								var firstName;
								//if "from" = logged in user, message type = sent, else recieved						
								if (senderID == localStorage.id) {
									var messageType = "sent";
									firstName = "Me";
								} else {
									var messageType = "received";
									//avatar and name for received message
									avatar = '';
									//firstName = matchName;
								}

								// init messages and messagebar globally
								var	myMessages = myApp.messages('.messages', {
			 						autoLayout:true
								});
								var	myMessagebar = myApp.messagebar('.messagebar');
						
								//add message
								myMessages.addMessage({
									//message data
									text: messageBody,
									type: messageType,
									avatar: avatar,
									//name: firstName,
									//date and time
									//if conversation is not started: "today", else: false (no day) 
									day: !conversationStarted ? 'Today' : false,
									time: !conversationStarted ? hours + ':' + minutes : false
  								})
 	
								//update conversation flag
								conversationStarted = true;
							}
						}
					} else {
						console.log("no new messages");
					}
				} else if (data.status == "error") {
					myApp.alert("Unknown error 04, please try again", "Action Failed");
				}
			},

			error: function(xhr, ajaxOptions, errorThrown) {
				console.log(xhr);
				console.log(errorThrown);
				myApp.alert("Check your internet", "No Connection");
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
}