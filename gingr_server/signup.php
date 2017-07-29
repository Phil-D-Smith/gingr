<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");

	require_once "config.php";

	if(isset($_POST['signup'])) {
		$firstname = mysql_real_escape_string(htmlspecialchars(trim($_POST["firstname"])));
		$lastname = mysql_real_escape_string(htmlspecialchars(trim($_POST["lastname"])));
		$email = mysql_real_escape_string(htmlspecialchars(trim($_POST["email"])));
		$password = mysql_real_escape_string(htmlspecialchars(trim($_POST["password"])));

		$login = mysql_num_rows(mysql_query("SELECT * FROM user_table WHERE email = $email"));
		if($login != 0) {
			echo "exist";
		} else {
			$date = date("y-m-d h:i:s");
			$sql = "INSERT INTO user_table VALUES ('', $date','$fullname','$email','$password')";
			
			if (mysql_query($sql)) {
				echo "Registration successful";
			} else {
				echo "Registration unsuccessful";
			}

		}
		echo mysql_error();
	}

?>