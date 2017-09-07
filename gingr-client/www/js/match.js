//initialize
//var myApp = new Framework7();

//custom DOM
//var $$ = Dom7;

//handle Cordova device ready event
$$(document).on('deviceready', function() {

	//wait for matches page to be fully loaded
	myApp.onPageInit('swipe', function(page) {
		console.log("swipe init");
		//get all matches (and new messages etc)
		//should probably only load a few at a time...
		getUsers();
		console.log("all users loaded");

		//on touch of a match, load those messages
		$(document).on("touchend", ".user", function(e) {
			e.preventDefault();
			console.log("user clicked");
			//get user ID from html element after templated
			var targetID = $(this).data("user-id");
			//store user ID locally to load correct messages in next page
			localStorage.targetID = targetID;
			//route to their profile page to view photos and bio, with YES/NO options.
			//mainView.router.loadPage("conversation.html");
		}); 

	});
	
	//setInterval(checkMessages, 3000);


});


//get list of all matches for user
function getUsers() {

	//get own user id from local stroage
	userID = localStorage.id;
	console.log(userID);

	//make data string
	var dataString = {"action": "getUsers", "id": userID};
	console.log(dataString);

	//ajax post to get user id from email
	$.ajax({
		type: "POST",
		url: "http://gingr-server.com/matches.php",
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
				for (i = 0; i < data.numUsers; i++) {
					//get into local variables for readability
					var targetID = data.users[i]["userID"];
					var targetFirstName = data.users[i]["firstName"];
					var targetLastName = data.users[i]["lastName"];
					var lastMessage = data.users[i]["age"];


					//need to filter so if date was yesterday, shows date

					//template engine to replace this
					var $userCard = $(	"<div data-user-id=" + targetID + " class='card user'>" +
											"<div class='card-content'>" +
												"<div><img src='media/harry.jpg' class='profile-picture'></div>" +
												"<p><b>" + targetName + ", " + targetAge + "</b></p>" + 
												"<p>" + targetLocation + "</p>" +
											"</div>" +
										"</div>" );


					$(".card-container").append($userCard);
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