$("#signup").click(function() {
	var firstname=$("#firstname").val();
	var lastname=$("#lastname").val();
	var email=$("#email").val();
	var password=$("#password").val();
	//var passwordhash=CryptoJS.MD5(password);
	var dataString="&firstname="+firstname+"&lastname="+lastname+"&email="+email+"&password="+password+"&signup=";

	if($.trim(firstname).length>0 & $.trim(email).length>0 & $.trim(password).length>0) {
		$.ajax({
			type: "POST",
			url: "http://192.168.1.101:80/server/signup.php",
			data: dataString,
			crossDomain: true,
			cache: false,

			beforeSend: function() {
				$("#signup").val('Connecting...');
			},

			success: function(data) {
				if(data=="success") {
					alert("Sign up successful");
				}else if(data="exist") {
					alert("Already have an account");
				}else if(data="failed") {
					alert("Something went wrong");
				}
			}
		});
	}return false;
});