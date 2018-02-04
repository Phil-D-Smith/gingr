//initialize
//var myApp = new Framework7();

//custom DOM
//var $$ = Dom7;

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {

	//wait for signup page to be fully loaded
	myApp.onPageInit('signup', function (page) {

		console.log("signup ready");

		//event listener for signup button
		//var signupButton = document.getElementById("signup");
		//if(signupButton) {
		//	signupButton.addEventListener("click", signup, false);
		//}

		//bit crap, sends two requests - works though
		//this handles the login button events for the mobile touch of the user
		$("#signup").on("touchend", function (e) {
			e.preventDefault();
			signup();
		});
	});

	//wait for login page to be fully loaded
	myApp.onPageInit('login', function (page) {

		console.log("login ready");
		
		//bit crap, sends two requests - works though
		//this handles the login button events for the mobile touch of the user
		window.localStorage.setItem("login", false);
		window.localStorage.setItem("email", 0);
		window.localStorage.setItem("id", 0);
		window.localStorage.setItem("matchID", 0);
		window.localStorage.setItem("matchName", 0);

		$("#login").on("touchend", function (e) {
			e.preventDefault();
			login();
		});

	});

	//wait for login page to be fully loaded
	myApp.onPageInit('recovery', function (page) {

		console.log("recovery ready");
		
		//bit crap, sends two requests - works though
		//this handles the login button events for the mobile touch of the user
		$("#recover").on("touchend", function (e) {
			e.preventDefault();
			recover();
		});

	});
});


//login an existing user
function login() {

	console.log("clicked");

	//get values of form into variables
	var email = $("#email").val();
	var password = $("#password").val();

	//create data array
	var dataString = {"action": "login", "email": email, "password": password};

	console.log(dataString);

	//check for blank inputs
	if ($.trim(email).length == 0) {
		myApp.alert("Email required", "Login Failed");
	} else if ($.trim(password).length == 0) {
		myApp.alert("Password required", "Login Failed");
	}

	//if form isnt empty, post ajax request to server
	if ($.trim(email).length > 0 & $.trim(password).length > 0) {

		console.log("input checked");

		$.support.cors = true;

		//ajax post
		$.ajax({
			type: "POST",
			url: server + "login/login/",
			data: JSON.stringify(dataString),
			dataType: 'json',
			crossDomain: true,
			cache: false,

			beforeSend: function() {
				console.log("connecting to server");
			},

			//display success/fail message - put something in data on server
			success: function(data, textString, xhr) {
				if (data.status == "correct") {
					window.localStorage.setItem("login", true);
					window.localStorage.setItem("email", email);
					window.localStorage.setItem("id", data.id);
					//mainView.router.loadPage("swipe.html");
					mainView.router.loadPage("dob.html");
				} else {
					myApp.alert("Incorrect email or password", "Login Failed");
				}
			},

			error: function(xhr, ajaxOptions, errorThrown) {
				console.log(xhr);
				console.log(errorThrown);
				myApp.alert("Unknown error, please try again", "Login Failed");
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

//signup a new user
function signup() {

	console.log("clicked");

	//get values of form into variables
	var firstname = $("#firstname").val();
	var lastname = $("#lastname").val();
	var email = $("#email1").val();
	var password = $("#password1").val();

	//create data array
	var dataString = {"action": "signup", "firstname": firstname, "lastname": lastname, "email": email, "password": password};

	console.log(dataString);

	// check for blank inputs
	if ($.trim(firstname).length == 0) {
		myApp.alert("Name required", "Signup Failed");
	} else if ($.trim(lastname).length == 0) {
		myApp.alert("Surname required", "Signup Failed");
	} else if ($.trim(email).length == 0) {
		myApp.alert("Email required", "Signup Failed");
	} else if ($.trim(password).length == 0) {
		myApp.alert("Password required", "Signup Failed");
	}

	// if none are blank, validate email address and continue - TBD - validateEmail() not working correctly
	else {

		console.log("input checked");

		$.support.cors = true;

		//ajax post to server
		$.ajax({
			type: "POST",
			url: server + "login/signup/",
			data: JSON.stringify(dataString),
			dataType: 'json',
			crossDomain: true,
			cache: false,

			beforeSend: function(data) {
				$("#signup").val('Connecting...');
				console.log("connecting to server");
			},

			//display success/fail message - put something in data on server
			success: function(data, textString, xhr) {
				if (data.status == "success") {
					//localStorage should be changed to nativeStorage plugin
					window.localStorage.setItem("login", true);
					window.localStorage.setItem("email", email);
					window.localStorage.setItem("id", data.id);
					window.localStorage.firstLogin = "true";
					console.log("redirecting...");
					//mainView.router.loadPage("swipe.html");
					mainView.router.loadPage("dob.html");
				} else if (data.status == 'exist') {
					myApp.alert("Account already exists", "Login Failed");
				}
			},

			error: function(xhr, ajaxOptions, errorThrown) {
				console.log(xhr);
				console.log(errorThrown);
				myApp.alert("Unknown error, please try again", "Login Failed");
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

//verify a user with a session ID saved locally
function verifyUser() {

	//create data array
	var dataString = {"action": "verify", "userID": window.localStorage.getItem("id")};

	console.log(dataString);

	//if form isnt empty, post ajax request to server
	if ($.trim(window.localStorage.getItem("id")).length > 0) {

		console.log("input checked");

		$.support.cors = true;

		//ajax post
		$.ajax({
			type: "POST",
			url: server + "login/verify/",
			data: JSON.stringify(dataString),
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
					console.log("session data OK");
					mainView.router.loadPage("swipe.html");
				} else {
					mainView.router.loadPage("login.html");
				}
			},

			error: function(xhr, ajaxOptions, errorThrown) {
				console.log(xhr);
				console.log(errorThrown);
				myApp.alert("Unknown error, please try again", "Login Failed");
				mainView.router.loadPage("login.html");
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

//recover a forgotten password
function recover() {

	//get values of form into variables
	var email = $("#email").val();

	//create data array
	var dataString = {"action": "recover", "userEmail": email};

	console.log(dataString);

	if ($.trim(email).length == 0) {
		myApp.alert("Email required", "Recovery Failed");
	} else if ($.trim(email).length > 0) {		

		console.log("input checked");

		$.support.cors = true;

		//ajax post
		$.ajax({
			type: "POST",
			url: server + "login/recover/",
			data: JSON.stringify(dataString),
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
					console.log("recovery email attempted");
					mainView.router.loadPage("recoveryCode.html");
				} else {
					myApp.alert("Session expired, please try again", "Login Failed");
				}
			},

			error: function(xhr, ajaxOptions, errorThrown) {
				console.log(xhr);
				console.log(errorThrown);
				myApp.alert("Unknown error, please try again", "Login Failed");
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





//validate email format - not working
function validateEmail(emailUT) {
    var filter = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; 

    if(!filter.test(emailUT.value)) {
    	myApp.alert("Invalid email address", "Login Failed");
    	return false;
    } else {
    	return true;
    }
}