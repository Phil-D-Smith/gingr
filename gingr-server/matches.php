<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	header('Content-Type: application/json');

	//include databse info
	require_once "db_config.php";

	//get list of all matches for a user
	function getMatches() {
  		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
  		if ($mysqli->connect_errno) {
  			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
  		}

		$originUserID = $mysqli->real_escape_string(htmlspecialchars($_POST["id"]));
		$targetUserID = 0;

		//find current message count for conversation
		$query = "	SELECT * FROM message_counter
					WHERE  user_id_1 = ?
					OR user_id_2 = ?";

		//prepare statement and handle error
		$stmt = $mysqli->prepare($query);

		//bind email to query and execute
		$stmt->bind_param("ss", $originUserID, $originUserID);
		if (!$stmt->execute()) {
			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result
		$result = $stmt->get_result();

		//if there is a result
		if ($result) {

			$numMatches = $result->num_rows;
			$allUsers = [];

			//loop through to get all matches ids and date of last 
			$i = 0;
			while ($row = $result->fetch_assoc()) {

				$matchID = $row["match_id"];
   				$user1 = $row["user_id_1"];
    			$user2 = $row["user_id_2"];
    			$dateTime = $row["date_time"];
    			$lastMessage = $row["last_message"];

    			//find target id and origin id, discard origin
    			if ($originUserID == $user1) {
    				$targetUserID = $user2;
    			} elseif ($originUserID == $user2) {
    				$targetUserID = $user1;
    			}

    			//get info of target users
    			$query = "	SELECT first_name, last_name FROM user_table
    						WHERE user_id = ?";

    			//prepare statement and handle error
				$stmt = $mysqli->prepare($query);

				//bind email to query and execute
				$stmt->bind_param("s", $targetUserID);
				if (!$stmt->execute()) {
					$response = ["status" => "error"];
  					$mysqli->close();
  					echo json_encode($response);
  					return;
				}

				//get result
				$userResult = $stmt->get_result();
    			$userRow = $userResult->fetch_assoc();
				$firstName = $userRow["first_name"];
				$lastName = $userRow["last_name"];

				//free memory
				$userResult->free();

    			//user array for each
    			$user = [	"matchID" => $matchID,
    						"firstName" => $firstName,
    						"lastName" => $lastName,
    						"dateTime" => $dateTime,
    						"lastMessage" => $lastMessage];

    			//put in another array for response
    			$allUsers[$i] = $user;
				$i++;
    		}
    		//free memory
			$result->free();

			//{status, numMatches, {user1, user2...}}
			$response = [	"status" => "success",
							"numMatches" => $numMatches,
							"users" => $allUsers];

		} else {
			$response = ["status" => "error"];
		}
		//close and respond
		$mysqli->close();
		echo json_encode($response);
	}

	//get all qualifying matches from server
	function getUsers() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
  		if ($mysqli->connect_errno) {
  			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
  		}

  		//get user id and preferences here
		$originUserID = $mysqli->real_escape_string(htmlspecialchars($_POST["id"]));
		$minAge = $mysqli->real_escape_string(htmlspecialchars($_POST["minAge"]));
		$maxAge = $mysqli->real_escape_string(htmlspecialchars($_POST["maxAge"]));
		$maxDistance = $mysqli->real_escape_string(htmlspecialchars($_POST["maxDistance"]));
		$gingerBool = $mysqli->real_escape_string(htmlspecialchars($_POST["gingerBool"]));

		//get all qualifying users from db
		$query = "	SELECT * FROM user_table
					WHERE  age >= ? AND age <= ? AND ginger = ?";

		//prepare statement and handle error
		$stmt = $mysqli->prepare($query);

		//bind email to query and execute
		$stmt->bind_param("s", $minAge, $maxAge, $gingerBool);
		if (!$stmt->execute()) {
			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result
		$result = $stmt->get_result();

		//if there is a result
		if ($result) {

			$numMatches = $result->num_rows;
			$allUsers = [];

			//loop through to get all matches ids and date of last 
			$i = 0;
			while ($row = $result->fetch_assoc()) {

				$matchID = $row["match_id"];
   				$user1 = $row["user_id_1"];
    			$user2 = $row["user_id_2"];
    			$dateTime = $row["date_time"];
    			$lastMessage = $row["last_message"];

    			//find target id and origin id, discard origin
    			if ($originUserID == $user1) {
    				$targetUserID = $user2;
    			} else if ($originUserID == $user2) {
    				$targetUserID = $user1;
    			}

    			//get info of target users
    			$userResult = $mysqli->query("	SELECT first_name, last_name FROM user_table
    											WHERE user_id = '$targetUserID'");
    			$userRow = $userResult->fetch_assoc();
				$firstName = $userRow["first_name"];
				$lastName = $userRow["last_name"];

				//free memory
				$userResult->free();

    			//user array for each
    			$user = [	"matchID" => $matchID,
    						"firstName" => $firstName,
    						"lastName" => $lastName,
    						"dateTime" => $dateTime,
    						"lastMessage" => $lastMessage];

    			//put in another array for response
    			$allUsers[$i] = $user;
				$i++;
    		}
    		//free memory
			$result->free();

			//{status, numMatches, {user1, user2...}}
			$response = [	"status" => "success",
							"numMatches" => $numMatches,
							"users" => $allUsers];

		} else {
			$response = ["status" => "error"];
		}
		//close and respond
		$mysqli->close();
		echo json_encode($response);
	}


	if($_POST['action'] == "getMatches") {
		getMatches();
	}

	if($_POST['action'] == "getUsers") {
		getUsers();
	}

?>