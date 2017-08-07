//initialize
//var myApp = new Framework7();

//custom DOM
//var $$ = Dom7;
console.log("script running");

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {

	//wait for signup page to be fully loaded
	myApp.onPageInit('signup', function (page) {

		console.log("signup ready");

		//event listener for signup button
		var signupButton = document.getElementById("signup");

		if(signupButton) {
			signupButton.addEventListener("click", signup, false);
		}
	
		//on click of signup button
		function signup() {

			console.log("clicked");

			//get values of form into variables
			var firstname = $("#firstname").val();
			var lastname = $("#lastname").val();
			var email = $("#email1").val();
			var password = $("#password1").val();

			//create data array
			var dataString = {firstname: firstname, lastname: lastname, email: email, password: password};

			console.log(dataString);

			//if form isnt empty, post ajax request to server
			if($.trim(firstname).length > 0 & $.trim(email).length > 0 & $.trim(password).length > 0) {

				console.log("input checked");

				$.ajax({
					type: "POST",
					url: "http://gingr-server.com/signup.php",
					data: dataString,
					crossDomain: true,
					cache: false,

					beforeSend: function() {
						$("#signup").val('Connecting...');
						console.log("connecting to server");
					},

					//display success/fail message - put something in data on server
					success: function(data, textString, xhr) {
						console.log(data);
						console.log(textString);
					},

					error: function(xhr, ajaxOptions, errorThrown) {
						console.log("error msg: ");
						console.log(xhr);
						console.log(errorThrown);
					},

					complete: function(data) {
						if(data.readyState == "0") {
							console.log("unsent");
						} else if(data.readyState == "4") {
							console.log("done");
						}	
					}

				});
			} return false;
		}
	});


	//wait for login page to be fully loaded
	myApp.onPageInit('login', function (page) {

		console.log("login ready");

		//event listener for signup button
		var loginButton = document.getElementById("login");

		if(loginButton) {
			loginButton.addEventListener("click", login, false);
		}
	
		//on click of login button
		function login() {

			console.log("clicked");

			//get values of form into variables
			var email = $("#email1").val();
			var password = $("#password1").val();

			//create data array
			var dataString = {email: email, password: password};

			console.log(dataString);

			//if form isnt empty, post ajax request to server
			if($.trim(email).length > 0 & $.trim(password).length > 0) {

				console.log("input checked");

				$.ajax({
					type: "POST",
					url: "http://gingr-server.com/login.php",
					data: dataString,
					crossDomain: true,
					cache: false,

					beforeSend: function() {
						$("#login").val('Connecting...');
						console.log("connecting to server");
					},

					//display success/fail message - put something in data on server
					success: function(data, textString, xhr) {
						console.log(data);
						console.log(textString);
					},

					error: function(xhr, ajaxOptions, errorThrown) {
						console.log("error msg: ");
						console.log(xhr);
						console.log(errorThrown);
					},

					complete: function(data) {
						if(data.readyState == "0") {
							console.log("unsent");
						} else if(data.readyState == "4") {
							console.log("done");
						}	
					}

				});
			} return false;
		}
	});
});