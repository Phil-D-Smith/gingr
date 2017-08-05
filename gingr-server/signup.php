<html>

<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	require_once "config.php";

	$db = mysqli_connect(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME)
  	or die('Error connecting to database');

	echo "on server";

	//if(isset($_POST['signup'])) {
		$firstname = mysqli_real_escape_string($db, htmlspecialchars($_POST["firstname"]));
		$lastname = mysqli_real_escape_string($db, htmlspecialchars($_POST["lastname"]));
		$email = mysqli_real_escape_string($db, htmlspecialchars($_POST["email"]));
		$password = mysqli_real_escape_string($db, htmlspecialchars($_POST["password"]));

		echo "is set";

		$login = mysqli_num_rows(mysqli_query($db, "SELECT * FROM user_table WHERE email = $email"));
		if($login != 0) {
			echo "exist";
		} else {
			$date = date("y-m-d h:i:s");
			$sql = "INSERT INTO user_table VALUES ('', $date','$fullname','$email','$password')";
			
			if (mysqli_query($db, $sql)) {
				echo "Registration successful";
			} else {
				echo "Registration unsuccessful";
			}

		}
		echo mysqli_error();
	//}

	mysqli_close($db);

?>

</html>