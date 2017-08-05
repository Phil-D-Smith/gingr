<html>

<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	require_once "config.php";
	echo "on server";

	if(isset($_POST['signup'])) {
		$firstname = mysql_real_escape_string(htmlspecialchars($_POST["firstname"]));
		$lastname = mysql_real_escape_string(htmlspecialchars($_POST["lastname"]));
		$email = mysql_real_escape_string(htmlspecialchars($_POST["email"]));
		$password = mysql_real_escape_string(htmlspecialchars($_POST["password"]));

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

</html>