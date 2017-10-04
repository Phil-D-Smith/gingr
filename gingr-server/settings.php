<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	header('Content-Type: application/json');

	//include databse info
	require_once "db_config.php";

	if($_POST['action'] === "loadProfile") {
		loadProfile();
	}

	if($_POST['action'] === "getPreferences") {
		getPreferences();
	}

	if($_POST['action'] === "setPreferences") {
		setPreferences();
	}

	if($_POST['action'] === "getSettings") {
		getSettings();
	}

	if($_POST['action'] === "setSettings") {
		setSettings();
	}

	//load a user's own profile info from db
	function loadProfile() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
  		if ($mysqli->connect_errno) {
  			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
  		}

		$userID = $mysqli->real_escape_string(htmlspecialchars($_POST["id"]));

		//get all info on user, leave preferences in db
		$query = "	SELECT first_name, dob, bio, profile_photo FROM user_table 
					WHERE user_id = ?";

		//prepare statement and handle error
		$stmt = $mysqli->prepare($query);

		//bind email to query and execute
		$stmt->bind_param("s", $userID);
		if (!$stmt->execute()) {
			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result
		if ($result = $stmt->get_result()) {

			$row = $result->fetch_assoc();
			//put in variables - photos as blobs
			$firstName = $row["first_name"];
   			$DOB = $row["dob"];
    		$bio = $row["bio"];
    		$profilePhoto = $row["profile_photo"];
    		//$profilePhoto = "media/ginger_kitten.jpg";
			//free memory
			$result->free();

    		//status, user info, photos
    		$response = [	"status" => "success",
    						"firstName" => $firstName,
    						"DOB" => $DOB,
    						"bio" => $bio,
    						"profilePhoto" => $profilePhoto ];

		} else {
			$response = ["status" => "error"];
		}
		//close and respond
		$mysqli->close();
		echo json_encode($response);
	}

	//retrieve current preferences from db
	function getPreferences() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
  		if ($mysqli->connect_errno) {
  			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
  		}

		$userID = $mysqli->real_escape_string(htmlspecialchars($_POST["id"]));

		//get all info on user, leave preferences in db
		$query = "	SELECT first_name, dob, gender, bio, profile_photo, ginger, latitude, longitude, ginger_pref FROM user_table 
					WHERE user_id = ?";

		//prepare statement and handle error
		$stmt = $mysqli->prepare($query);

		//bind email to query and execute
		$stmt->bind_param("s", $userID);
		if (!$stmt->execute()) {
			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result
		if ($result = $stmt->get_result()) {

			$row = $result->fetch_assoc();
			//put in variables
			$hair = $row["hair"];
   			$DOB = $row["dob"];
    		$notifications = $row["notifications"];
			//free memory
			$result->free();

    		//status, user info, photos
    		$response = [	"status" => "success",
    						"hair" => $hair,
    						"DOB" => $DOB,
    						"notifications" => $notifications ];

		} else {
			$response = ["status" => "error"];
		}
		//close and respond
		$mysqli->close();
		echo json_encode($response);
	}

	//update db with new preferences
	function setPreferences() {

	}

	//retrieve current settings from db
	function getSettings() {

	}

	//update db with new settings
	function setSettings() {

	}



?>