<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	header('Content-Type: application/json');

	//include databse info
	require_once "db_config.php";

	if($_POST['action'] === "login") {
		login();
	}

	if($_POST['action'] === "signup") {
		signup();
	}

	if($_POST['action'] === "verify") {
		verify();
	}

	if($_POST['action'] === "recover") {
		recover();
	}


  	//if login is clicked
	function login() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME)
  		or die('Error connecting to database');

  		//escape, remove special characters, and format 
		$email = $mysqli->real_escape_string(htmlspecialchars(strtolower($_POST["email"])));
		$password = $mysqli->real_escape_string(htmlspecialchars($_POST["password"]));

		//get hashed password from db
		$query = "SELECT password, user_id FROM user_table WHERE email = ?";

		//prepare statement and handle error
		$stmt = $mysqli->prepare($query);

		//bind email to query and execute
		$stmt->bind_param("s", $email);
		if (!$stmt->execute()) {
			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result
		$result = $stmt->get_result();
		$row = $result->fetch_assoc();
		$passwordHash = $row["password"];
		$userID = $row["user_id"];

		//free memory
		$result->free();

		//verify password for that email
		if (password_verify($password, $passwordHash)) {
    		$response = [	"status" => "correct",
    						"id" => $userID];
		} else {
    		$response = ["status" => "incorrect"];
    	}

    	$mysqli->close();
    	echo json_encode($response); 	
    }

    //if signup is clicked
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
		//$userID = $row["user-id"];
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

	//if session data is stored
	function verify() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME)
  		or die('Error connecting to database');

  		//escape, remove special characters, and format appropriately
		$userID = $mysqli->real_escape_string(htmlspecialchars($_POST["userID"]));

		//check if email already in database
		$query = "SELECT user_table.* FROM user_table WHERE user_id = ?";
		
		$emailStmt = $mysqli->prepare($query);

		//bind email to query and execute
		$emailStmt->bind_param("s", $userID);
		if (!$emailStmt->execute()) {
			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result
		$result = $emailStmt->get_result();
		$row = $result->fetch_assoc();
		//get number of rows to check if user already exists
		$login = $result->num_rows;
		//free memory
		$result->free();

		//if the user exists, exit with "exist"
		if($login != 0) {
			$response = ["status" => "success"];
			$mysqli->close();
			echo json_encode($response);
		} else {
			$response = ["status" => "invalid"];
  			$mysqli->close();
  			echo json_encode($response);
		}
	}
	
	//recover a forgotten password
	function recover() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME)
  		or die('Error connecting to database');

  		//escape, remove special characters, and format appropriately
		$userEmail = $mysqli->real_escape_string(htmlspecialchars($_POST["userEmail"]));

		//generate 4 digit random code
		$randCode = rand(1000, 9999);

		//compose email with code
		$to = $userEmail;
		$subject = "Gingr password recovery";
		$txt = "Your password recovery code is:" . "\r\n" . $randCode;
		$headers = "From: noreply@gingr_test.com";

		//send recovery email
		mail($to, $subject, $txt, $headers);
	}
?>