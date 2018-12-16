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
		var userID = window.localStorage.getItem("id");
		getPreferences(userID);
	});

	myApp.onPageInit('settings', function (page) {
		var userID = window.localStorage.getItem("id");
		getSettings(userID);
	});

	//wait for profile page to be fully loaded
	myApp.onPageInit('profile', function (page) {
		var userID = window.localStorage.getItem("id");
		loadProfile(userID);
	});

	//wait for dob page to be fully loaded
	myApp.onPageInit('dob', function(page) {
		console.log("dob init");
		//load DOB wheels on screen
		setDOB();
		//when next is pressed, send DOB to server
		$("#signup").on("touchend", function (e) {
			e.preventDefault();
			});
	});

});

//logout and clear session data from storage
function logout() {
	//confirm message - callback
    myApp.confirm("Are you sure?", "Log Out", function () {
    	//clear local data
    	window.localStorage.setItem("login", false);
		window.localStorage.setItem("email", 0);
		window.localStorage.setItem("id", 0);
		window.localStorage.setItem("matchID", 0);
		window.localStorage.setItem("matchName", 0);
		//redirect to login page
		mainView.router.loadPage("login.html");
    });
}

//get all profile info and photos for user clicked on
function loadProfile(userID) {
	//get id stored locally
	var userID = localStorage.getItem("id");

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

function setDOB() {
	var pickerCustomToolbar = myApp.picker({
		input: '#dob-picker',
  		rotateEffect: true,
  		closeByOutsideClick: false,
  		renderToolbar: function () {
    		return '<div class="toolbar">' +
      			'<div class="toolbar-inner">' +
        			'<div class="left">' +
        				'<a href="#" class="link toolbar-randomize-link"></a>' +
        			'</div>' +
        			'<div class="right">' +
          				'<a href="#" class="link sheet-close popover-close">Next</a>' +
        			'</div>' +
      			'</div>' +
    		'</div>';
  		},
  		cols: [
    		{
      			values: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31],
    		},
    		{
      			textAlign: 'left',
      			values: ('January February March April May June July August September October November December').split(' ')
    		},
    		{
      			values: (function () {
        			var arr = [];
        			for (var i = 1900; i <= 2030; i++) { arr.push(i); }
          				return arr;
      			})(),
    		},
  		],
  		on: {
    		open: function (picker) {
    			return 0;
    		},
  		}
	});
	pickerCustomToolbar.open(); // open Picker
}