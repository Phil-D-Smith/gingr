//initialize
//var myApp = new Framework7();

//custom DOM
//var $$ = Dom7;

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {

	//wait for settings page to be fully loaded
	myApp.onPageInit('settings', function (page) {

		$("#logout").on("touchend", function (e) {
			e.preventDefault();
			logout();
			console.log("logout clicked");
		});
	});

	//wait for preferences page to be fully loaded
	myApp.onPageInit('preferences', function (page) {
		var userID = localStorage.id;
		getPreferences(userID);
	});

	myApp.onPageInit('settings', function (page) {
		var userID = localStorage.id;
		getSettings(userID);
	});

	//wait for profile page to be fully loaded
	myApp.onPageInit('profile', function (page) {
		var userID = localStorage.id;
		loadProfile(userID);
	});

});

//logout and clear session data from storage
function logout() {
	//confirm message - callback
    myApp.confirm("Are you sure?", "Log Out", function () {
    	//clear local data
    	localStorage.login = "false";
		localStorage.email = 0;
		localStorage.id = 0;
		localStorage.matchID = 0;
		localStorage.matchName = 0;
		//redirect to login page
		mainView.router.loadPage("login.html");
    });
}

//get all profile info and photos for user clicked on
function loadProfile(userID) {
	//get id stored locally
	var userID = localStorage.id;

	//make data string - could send current lat/long here?
	var dataString = {"action": "loadProfile", "id": userID};
	console.log(dataString);

	//ajax post to get user profile data
	$.ajax({
		type: "POST",
		url: server + "/settings.php",
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
				var DOB = data.DOB;
				//get age from DOB and current date
				var currentDate = new Date();
				var DOB = new Date(DOB);
				var ageMilli = Math.abs(currentDate.getTime() - DOB.getTime());
				var age = Math.ceil(ageMilli / (1000 * 3600 * 24 * 365.25));

				//"templates" for user profile
				var $info = $(	"<p><b>" + firstName + ", " + age + "</b></p>" +
								"<p>0 miles away</p>" +
               					"<p>" + bio + "</p>" );

				//add photo (blob) and info to DOM
				$(".profile-photo").css("background-image","url(data:image/png;base64," + profilePhoto + ")");
				$(".user-info").append($info);

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

//get the current preferences and set the radio buttons / sliders accordingly
function getPreferences(userID) {
	//request preferences for the user logged in
	//create data array
	var dataString = {"action": "getPreferences", "userID": userID};

	console.log(dataString);

	//if form isnt empty, post ajax request to server
	if ($.trim(userID).length > 0) {

		console.log("input checked");

		$.support.cors = true;

		//ajax post
		$.ajax({
			type: "POST",
			url: server + "/settings.php",
			data: dataString,
			dataType: 'json',
			crossDomain: true,
			cache: false,

			beforeSend: function() {
				$("#login").val('Connecting...');
				console.log("connecting to server");
			},

			//display success/fail message - put something in data on server
			success: function(data, textString, xhr) {
				if (data.status == "success") {
					var hairPref = data.hairPref;
					var genderPref = data.genderPref;
					var distancePref = data.distancePref;
					//get the preferences into variables

					//set radios accordingly
				} else {
					myApp.alert("Cannot load settings, please try again", "Loading Failed");
				}
			},

			error: function(xhr, ajaxOptions, errorThrown) {
				console.log(xhr);
				console.log(errorThrown);
				myApp.alert("Cannot load settings, please try again", "Loading Failed");
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
	return false;
}

//store new radio/slider preferences in database when page is closed
function setPreferences(userID) {

}

//get the settings for that user for display, store locally ready for next pages
function getSettings(userID) {

}

//store new radio inputs in database when page is closed
function setSettings(userID) {

}