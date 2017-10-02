//initialize
//var myApp = new Framework7();

//custom DOM
//var $$ = Dom7;
var matchInterval = 20000;
var currentPage = null;

//handle Cordova device ready event
$$(document).on('deviceready', function() {

	//wait for home page to be fully loaded - list for decisions in background
	myApp.onPageInit('swipe', function(page) {
		console.log("swipe init");
		currentPage = "matches";
		matchCheck = setInterval(getUsers, matchInterval);
		//get all matches - clear and reload periodically
		localStorage.offset = 0;
		getUsers();

		console.log("all users loaded");

		//on touch of a match, load those messages
		$(document).on("touchend", ".user-click", function(e) {
			e.preventDefault();
			console.log("user clicked");
			//get user ID from html element after templated
			var targetID = $(this).data("user-id");
			//store user ID locally to load correct messages in next page
			localStorage.targetID = targetID;
			console.log(targetID);
			//route to their profile page to view photos and bio, with YES/NO options.
			mainView.router.loadPage("targetProfile.html");
		}); 

		//listen for decisions - html datatag each uid
		//on touch of tick
		$(document).on("touchend", "#decision-yes", function(e) {
			//get user-id from DOM data
			var targetID = $(this).data("user-id");
			submitDecision(targetID, 1);
		});
		//on touch of cross
		$(document).on("touchend", "#decision-no", function(e) {
			//get user-id from DOM data
			var targetID = $(this).data("user-id");
			submitDecision(targetID, 0);
		});
	});

	//when profile page loaded, populate page and listen for decision
	myApp.onPageInit('targetProfile', function(page) {
		currentPage = "targetProfile";
		loadTargetProfile(localStorage.targetID);

		//on touch of tick
		$(document).on("touchend", "#prof-decision-yes", function(e) {
			//get user-id from DOM data
			var targetID = $(this).data("user-id");
			//submit and go back
			submitDecision(targetID, 1);
		});
		//on touch of cross
		$(document).on("touchend", "#prof-decision-no", function(e) {
			//get user-id from DOM data
			var targetID = $(this).data("user-id");
			//submit and go back
			submitDecision(targetID, 0);
		});
	});
});


//get list of all matches for user - loads only first photo
function getUsers() {

	//get own user id from local stroage
	var loadLimit = 24;
	var userID = localStorage.id;
	console.log(userID);

	//make data string
	var dataString = {"action": "getUsers", "id": userID, "limit": loadLimit, "offset": localStorage.offset};
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
			if (data.status == "success" && data.numUsers > 0) {
				//change offset for next load
				localStorage.offset = parseInt(localStorage.offset) + data.nextOffset;
				//clear the invisible cards
				$(".invisible").remove();
				//loop through matched user data and populate list
				for (i = 0; i < data.numUsers; i++) {
					//get into local variables for readability
					var targetID = data.users[i]["userID"];
					var targetFirstName = data.users[i]["firstName"];
					var targetLastName = data.users[i]["lastName"];
					var targetDOB = data.users[i]["DOB"];
					var targetDistance = data.users[i]["distance"];
					//get age from DOB and current date
					var currentDate = new Date();
					var DOB = new Date(targetDOB);
					var ageMilli = Math.abs(currentDate.getTime() - DOB.getTime());
					var targetAge = Math.ceil(ageMilli / (1000 * 3600 * 24 * 365.25));

					//template engine to replace this
					//info, photo, and buttons with id data
					var $userCard = $(	"<div class='card user-card'>" +
											"<div class='card-content'>" +
												"<div data-user-id=" + targetID + " class='user-click'>" +
													"<div style='background-image:url(" + "media/ginger_kitten.jpg" + ")' valign='bottom' class='card-header color-white no-border'></div>" +
													"<div class='card-content-inner'>" +
														"<p><b>" + targetFirstName + ", " + targetAge + "</b></p>" + 
														"<p>" + targetDistance + " miles away</p>" +
													"</div>" +
												"</div>" +
												"<div class='card-footer' style='height: 80px;'>" +
                        							"<a data-user-id=" + targetID + " href='#' class='link' id='decision-yes' name='decision-yes'>" +
                        								"<i style='font-size: 50px; color: green;' class='f7-icons'>check_round_fill</i>" +
                        							"</a>" +
                        							"<a data-user-id=" + targetID + " href='#' class='link' id='decision-no' name='decision-no'>" +
                        								"<i style='font-size: 50px; color: red;' class='f7-icons'>close_round_fill</i>" +
                        							"</a>" +
                    							"</div>" +
											"</div>" +
										"</div>" );


					$(".card-container").append($userCard);
				}
				//this is just a really rubbish way of aligning the cards correctly
				var $blankItems = $(	"<div class='card user-card invisible'></div>" +
										"<div class='card user-card invisible'></div>" );

				$(".card-container").append($blankItems);

			} else if (data.status == "success" && data.numUsers == 0) {
				//do not chang offset - for testing
				localStorage.offset = parseInt(localStorage.offset);
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

//get all profile info and photos for user clicked on
function loadTargetProfile(targetID) {

	//get id stored locally
	var userID = localStorage.id;

	//make data string - could send current lat/long here?
	var dataString = {"action": "loadTargetProfile", "id": userID, "targetID": targetID};
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
				//get into local variables for readability
				var firstName = data.firstName;
				var bio = data.bio;
				var profilePhoto = data.profilePhoto;
				//var otherPhotos = data.otherPhotos;
				var targetDOB = data.DOB;
				var targetDistance = data.distance;
				//get age from DOB and current date
				var currentDate = new Date();
				var DOB = new Date(targetDOB);
				var ageMilli = Math.abs(currentDate.getTime() - DOB.getTime());
				var age = Math.ceil(ageMilli / (1000 * 3600 * 24 * 365.25));

				//"templates" for user profile
				var $image = $("<div style='background-image:url(" + profilePhoto + ")' valign='bottom' class='card-header color-white no-border'></div>");

				var $info = $(	"<p><b>" + firstName + ", " + age + "</b></p>" +
								"<p>" + targetDistance + " miles away</p>" +
               					"<p>" + bio + "</p>" );

				//buttons with id embedded in dom, bad way of doing this but oh well
				var $buttons = $( 	"<a data-user-id=" + targetID + " href='#' class='link' id='prof-decision-yes' name='decision-yes'>" +
										"<i style='font-size: 50px; color: green;' class='f7-icons'>check_round_fill</i>" +
									"</a>" +
                        			"<a data-user-id=" + targetID + " href='#' class='link' id='prof-decision-no' name='decision-no'>" +
                        				"<i style='font-size: 50px; color: red;' class='f7-icons'>close_round_fill</i>" +
                        			"</a>" );

				//add to DOM
				$(".target-profile-photo").append($image);
				$(".target-info").append($info);
				$(".target-buttons").append($buttons);

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

//submit decision on user to database and remove card from swipe page (or go back)
function submitDecision(targetID, decision) {
	//get from local storage
	var originID = localStorage.id;

	//make data string - could send current lat/long here?
	var dataString = {"action": "submitDecision", "originID": originID, "targetID": targetID, "decision": decision};
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
			if (data.status == "match") {
				console.log("match");

			} else if (data.status == "success") {
				//if on swipe page - remove card, else - go back
				if (currentPage == "swipe") {
					//filter cards by data attr userID, and remove the one clicked
					$(".user-card").filter("[data-user-id=" + targetID + "]").remove();
				} else if (currentPage == "targetProfile") {
					//go back
					mainView.router.back(url = "swipe.html", ignoreCache = true, force = true);
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