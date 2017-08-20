<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	//include databse info
	require_once "db_config.php";

	//if(isset($_POST['signup'])) {
  		//escape, remove special characters, and format appropriately
		$firstname = $mysqli->real_escape_string(htmlspecialchars(ucwords(strtolower($_POST["firstname"]))));
		$lastname = $mysqli->real_escape_string(htmlspecialchars(ucwords(strtolower($_POST["lastname"]))));
		$email = $mysqli->real_escape_string(htmlspecialchars(strtolower($_POST["email"])));
		$password = $mysqli->real_escape_string(htmlspecialchars($_POST["password"]));

		//built in salt
		$passwordHash = password_hash($password, PASSWORD_DEFAULT);

		//check if email already in database
		$result = $mysqli->query("SELECT user_table.* FROM user_table WHERE email = '$email'");
		//echo $mysqli->error;
		$row = $result->fetch_assoc();
		$userID = $row["id"];

		$login = $result->num_rows;
		if($login != 0) {
			echo "exist";
		} else {
			//if email does not exist, sign up and send details to db
			$date = date("Y-m-d H:i:s");
			$sql = "INSERT INTO user_table (reg_date, first_name, last_name, email, password) VALUES ('$date', '$firstname', '$lastname', '$email', '$passwordHash')";

			if ($mysqli->query($sql)) {
				echo json_encode(array(	"status" => "success",
										"id" => $userID));
			} else {
				echo json_encode(array("status" => "error"));
			}

		}
	//}

	//free memory
	$result->free();

	$mysqli->close();

?>