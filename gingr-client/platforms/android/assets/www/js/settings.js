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
		currentPreferences(userID);
	});

	//wait for profile page to be fully loaded
	myApp.onPageInit('profile', function (page) {
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
//get the current preferences and set the radio buttons / sliders accordingly
function currentPreferences(userID) {
	//request preferences for the user logged in
	//create data array
	var dataString = {"action": "currentPreferences", "userID": userID};

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

//set the new radio/slider inputs when preference page is closed
function setPreferences(userID) {

}