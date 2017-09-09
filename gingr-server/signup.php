<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	header('Content-Type: application/json');

	//include databse info
	require_once "db_config.php";

	if($_POST['action'] == "signup") {
		signup();
	}

	function signup() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME)
  		or die('Error connecting to database');

  		//escape, remove special characters, and format appropriately
		$firstname = $mysqli->real_escape_string(htmlspecialchars(ucwords(strtolower($_POST["firstname"]))));
		$lastname = $mysqli->real_escape_string(htmlspecialchars(ucwords(strtolower($_POST["lastname"]))));
		$email = $mysqli->real_escape_string(htmlspecialchars(strtolower($_POST["email"])));
		$password = $mysqli->real_escape_string(htmlspecialchars($_POST["password"]));

		//built in salt
		$passwordHash = password_hash($password, PASSWORD_DEFAULT);

		//check if email already in database
		$query = "SELECT user_table.* FROM user_table WHERE email = ?";
		
		$emailStmt = $mysqli->prepare($query);

		//bind email to query and execute
		$emailStmt->bind_param("s", $email);
		if (!$emailStmt->execute()) {
			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result
		$result = $emailStmt->get_result();
		$row = $result->fetch_assoc();
		$userID = $row["id"];
		//get number of rows to check if user already exists
		$login = $result->num_rows;
		//free memory
		$result->free();

		//if the user exists, exit with "exist"
		if($login != 0) {
			$response = [	"status" => "exist"];
			$mysqli->close();
			echo json_encode($response);
		} else {
			//if email does not exist, sign up and send details to db
			$userID = uniqid('', $more_entropy = true);
			$date = date("Y-m-d H:i:s");

			$query = "	INSERT INTO user_table (user_id, reg_date, first_name, last_name, email, password) 
						VALUES (?, ?, ?, ?, ?, ?)";

			//prepare query
			$signupStmt = $mysqli->prepare($query);

			//bind email to query and execute
			$signupStmt->bind_param("ssssss", $userID, $date, $firstname, $lastname, $email, $passwordHash);
			if (!$signupStmt->execute()) {
				$response = ["status" => "error"];
  				$mysqli->close();
  				echo json_encode($response);
  				return;
			} else {


				//re-run email check to get new user id, if successfully signed up, login
				if (!$emailStmt->execute()) {
					$response = ["status" => "error"];
  					$mysqli->close();
  					echo json_encode($response);
  					return;
				}

				//get result
				$result = $emailStmt->get_result();
				$row = $result->fetch_assoc();
				$userID = $row["user_id"];

				$response = [	"status" => "success",
								"id" => $userID];
				echo json_encode($response);
			}
		}

		$mysqli->close();
	}

?>