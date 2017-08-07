<html>

<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	require_once "config.php";

	$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME)
  	or die('Error connecting to database');

	//if(isset($_POST['signup'])) {
		$firstname = $mysqli->real_escape_string(htmlspecialchars($_POST["firstname"]));
		$lastname = $mysqli->real_escape_string(htmlspecialchars($_POST["lastname"]));
		$email = $mysqli->real_escape_string(htmlspecialchars($_POST["email"]));
		$password = $mysqli->real_escape_string(htmlspecialchars($_POST["password"]));

		$passwordHash = password_hash($password, PASSWORD_DEFAULT);

		$result = $mysqli->query("SELECT user_table.* FROM user_table WHERE email = '$email'");
		echo $mysqli->error;

		$login = $result->num_rows;
		if($login != 0) {
			echo "exist";
		} else {
			$date = date("Y-m-d H:i:s");
			echo $date;
			$sql = "INSERT INTO user_table (reg_date, first_name, last_name, email, password) VALUES ('$date', '$firstname', '$lastname', '$email', '$passwordHash')";
			
			if ($mysqli->query($sql)) {
				echo "Registration successful";
			} else {
				echo "Registration unsuccessful";
			}

		}
	//}

	$mysqli->close();

?>

</html>