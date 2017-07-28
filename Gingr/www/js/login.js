$("#signup").click(function() {
	var firstname=$("#firstname").val();
	var lastname=$("#lastname").val();
	var email=$("#email").val();
	var password=$("#password").val();
	//var passwordhash=CryptoJS.MD5(password);
	var dataString=	"&firstname="+firstname+
					"&lastname="+lastname+
					"&email="+email+
					"&password="+password;

	if($.trim(firstname).length>0 & $.trim(email).length>0 & $.trim(password).length>0) {
		$.ajax({
			type: "POST",
			url: "http://localhost/gingr_server/signup.php",
			data: dataString,
			crossDomain: true,
			cache: false,

			beforeSend: function() {
				$("#signup").val('Connecting...');
				console.log("connecting to server");
			},

			success: function(data) {
				if(data=="success") {
					alert("Sign up successful");
					console.log("connection successful - signed up");
				}else if(data="exist") {
					alert("Already have an account");
					console.log("connection successful - user exists");
				}else if(data="failed") {
					alert("Something went wrong");
				}
			}
		});
	}return false;
});