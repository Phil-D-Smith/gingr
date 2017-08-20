<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	//include databse info
	require_once "db_config.php";

  	//if login is clicked
  	//if(isset($_POST['signup'])) {
		$email = $mysqli->real_escape_string(htmlspecialchars($_POST["email"]));
		$password = $mysqli->real_escape_string(htmlspecialchars($_POST["password"]));

		//get hashed password from db
		$result = $mysqli->query("SELECT password, id FROM user_table WHERE email = '$email'");
		$row = $result->fetch_assoc();
		$passwordHash = $row["password"];
		$userID = $row["id"];

		//free memory
		$result->free();

		//verify password for that email
		if (password_verify($password, $passwordHash)) {
    		echo json_encode(array(	"status" => "correct",
    								"id" => $userID));
		} else {
    		echo json_encode(array("status" => "incorrect"));
    	}

    //}

    $mysqli->close();


?>