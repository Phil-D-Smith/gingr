//initialize
var myApp = new Framework7();

//custom DOM
var $$ = Dom7;

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {

	console.log("clicked");
	
	//on click of signup button
	$("#signup").click(function() {

		console.log("clicked");


		//get values of form into variables
		var firstname = $("#firstname").val();
		var lastname = $("#lastname").val();
		var email = $("#email").val();
		var password = $("#password").val();

		//string and serialize
		var dataString =	"&firstname="+firstname+
							"&lastname="+lastname+
							"&email="+email+
							"&password="+password;


		//if form isnt empty, post ajax request to server
		if($.trim(firstname).length>0 & $.trim(email).length>0 & $.trim(password).length>0) {
			$.ajax({
				type: "POST",
				url: "http://localhost:80/gingr_server/signup.php",
				async: false,
				data: dataString,
				crossDomain: true,
				cache: false,

				beforeSend: function() {
					$("#signup").val('Connecting...');
					console.log("connecting to server");
				},

				//display success/fail message
				success: function(data) {
					if(data == "success") {
						alert("Sign up successful");
						console.log("connection successful - signed up");
					}else if(data = "exist") {
						alert("Already have an account");
						console.log("connection successful - user already exists");
					}else if(data = "failed") {
						alert("Something went wrong");
					}
				}
			});
		} return false;
	});
});