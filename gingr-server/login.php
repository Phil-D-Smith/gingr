<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	header('Content-Type: application/json');

	//include databse info
	require_once "db_config.php";

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

	if($_POST['action'] == "login") {
		login();
	}

    

?>