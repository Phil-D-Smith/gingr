<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	header('Content-Type: application/json');

	//include databse info
	require_once "db_config.php";

	if($_POST['action'] == "getUsers") {
		getUsers();
	}

	if($_POST['action'] == "getMatches") {
		getMatches();
	}

	if($_POST['action'] == "loadTargetProfile") {
		loadTargetProfile();
	}

	if($_POST['action'] == "submitDecision") {
		submitDecision();
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

  		//get user id and preferences here - from DB
		$originUserID = $mysqli->real_escape_string(htmlspecialchars($_POST["id"]));
		$limit = $mysqli->real_escape_string(htmlspecialchars($_POST["limit"]));
		$offset = $mysqli->real_escape_string(htmlspecialchars($_POST["offset"]));


		//get preferences from database
    	$query = "	SELECT max_age, min_age, max_distance, ginger_pref FROM user_table
    				WHERE user_id = ?";

    	//prepare statement and execute
		$stmt = $mysqli->prepare($query);
		$stmt->bind_param("s", $originUserID);
		if (!$stmt->execute()) {
			$response = ["status" => "error"];
 			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result
		$result = $stmt->get_result();
    	$row = $result->fetch_assoc();
		$minAge = $row["min_age"];
		$maxAge = $row["max_age"];
		$maxDistance = $row["max_distance"];
		$maxAge = $row["max_age"];
		$hairPref = $row["ginger_pref"];

		//split the hair preference into boolean
		if ($hairPref == 2) {
			$gingerPref = 1;
			$nonGingerPref = 1;
		} else if ($hairPref == 1) {
			$gingerPref = 1;
			$nonGingerPref = 0;
		} else if ($hairPref == 0) {
			$gingerPref = 0;
			$nonGingerPref = 1;
		}
		$nonGingerPref = !$nonGingerPref;

		//free memory
		$result->free();

		//calc min and max DOB from min and max age
		$maxDOB = date("Y-m-d", strtotime("-$minAge years"));
		$minDOB = date("Y-m-d", strtotime("-$maxAge years"));

		//need to do some crazy geometry calculation here - given lat, long and distance, work out max/min lat/long (square probably easiest for now)

		//get all qualifying users from db - order pseudo-randomly (really bad way of doing it, fix this Phil)
		$query = "	SELECT user_id FROM user_table
					WHERE (DOB < ? AND DOB > ?) AND (ginger = ? OR ginger = ?) AND (user_id != ?) ORDER BY user_id DESC LIMIT ? OFFSET ?";

		//prepare statement and handle error
		$stmt = $mysqli->prepare($query);
		//bind email to query and execute - not sure how ginger boolean will work here
		$stmt->bind_param("ssiisii", $maxDOB, $minDOB, $gingerPref, $nonGingerPref, $originUserID, $limit, $offset);
		if (!$stmt->execute()) {
			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result - if there is a result
		if ($result = $stmt->get_result()) {
			//set up array for all users to be appended to
			$nextOffset = $result->num_rows;
			$allUsers = [];

			//loop through to get all users and check against "decisions" table
			$i = 0;
			while ($row = $result->fetch_assoc()) {
				$targetUserID = $row["user_id"];

    			//check against decisions here
    			$query = (" SELECT origin_user_id FROM user_decisions
    						WHERE 	(origin_user_id = ? AND target_user_id = ?) OR 
									(origin_user_id = ? AND target_user_id = ?)" );

    			//prepare statement and handle error
				$stmt = $mysqli->prepare($query);

				//bind email to query and execute
				$stmt->bind_param("ssss", $originUserID, $targetUserID, $targetUserID, $originUserID);
				if (!$stmt->execute()) {
					$response = ["status" => "error"];
  					$mysqli->close();
  					echo json_encode($response);
  					return;
				}

				//get result
				$decResult = $stmt->get_result();
				$decRow = $decResult->fetch_assoc();

				//get number of rows to check if decision has already been made
				$decCheck = $decResult->num_rows;
				//free memory
				$decResult->free();

				if ($decCheck == 0) {
					//if okay, get all the info for that user
    				//get info of target users
    				$query = ("	SELECT first_name, last_name, dob, profile_photo FROM user_table
    							WHERE user_id = ?");

    				//prepare statement and handle error
					$userStmt = $mysqli->prepare($query);

					//bind email to query and execute
					$userStmt->bind_param("s", $targetUserID);
					if (!$userStmt->execute()) {
						$response = ["status" => "error"];
  						$mysqli->close();
  						echo json_encode($response);
  						return;
					}
					//get result
					$userResult = $userStmt->get_result();
    				$userRow = $userResult->fetch_assoc();
					$firstName = $userRow["first_name"];
					$lastName = $userRow["last_name"];
					$DOB = $userRow["dob"];

					//calc distance between user and target using crazy geometry
					$distance = 4.3;

					//free memory
					$userResult->free();

	    			//user array for each
    				$user = [	"userID" => $targetUserID,
    							"firstName" => $firstName,
    							"lastName" => $lastName,
    							"DOB" => $DOB,
    							"distance" => $distance];

    				//put in another array for response
    				$allUsers[$i] = $user;
					$i++;
				}
    		}
    		//free memory
			$result->free();

			//{status, numMatches, {user1, user2...}}
			$response = [	"status" => "success",
							"numUsers" => $i,
							"nextOffset" => $nextOffset,
							"users" => $allUsers];

		} else {
			$response = ["status" => "empty"];
		}
		//close and respond
		$mysqli->close();
		echo json_encode($response);
	}

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
					OR user_id_2 = ? ORDER BY date_time DESC";

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

			//loop through to get all matches ids and date of last - really need to order the results by date...
			$i = 0;
			while ($row = $result->fetch_assoc()) {

				$matchID = $row["match_id"];
   				$user1 = $row["user_id_1"];
    			$user2 = $row["user_id_2"];
    			$dateTime = $row["date_time"];
    			$lastMessage = stripslashes($row["last_message"]);

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

	//fully load a target profile and all photos
	function loadTargetProfile() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
  		if ($mysqli->connect_errno) {
  			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
  		}

		$originUserID = $mysqli->real_escape_string(htmlspecialchars($_POST["id"]));
		$targetUserID = $mysqli->real_escape_string(htmlspecialchars($_POST["targetID"]));

		//get all info on user, leave preferences in db
		$query = "	SELECT first_name, dob, gender, bio, profile_photo, ginger, latitude, longitude, ginger_pref FROM user_table 
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
		if ($result = $stmt->get_result()) {

			$row = $result->fetch_assoc();
			//put in variables
			$firstName = $row["first_name"];
   			$DOB = $row["dob"];
    		$gender = $row["gender"];
    		$bio = $row["bio"];
    		$ginger = $row["ginger"];
    		$latitude = $row["latitude"];
    		$longitude = $row["longitude"];
    		$gingerPref = $row["ginger_pref"];
    		$profilePhoto = 0;
			//free memory
			$result->free();

			//calc distance between origin and target
			$distance = 0;

    		//status, user info, photos
    		$response = [	"status" => "success",
    						"firstName" => $firstName,
    						"DOB" => $DOB,
    						"gender" => $gender,
    						"bio" => $bio,
    						"ginger" => $ginger,
    						"distance" => $distance,
    						"gingerPref" => $gingerPref,
    						"profilePhoto" => $profilePhoto ];

    	

		} else {
			$response = ["status" => "error"];
		}
		//close and respond
		$mysqli->close();
		echo json_encode($response);
	}

	//submit swipe decision to decisions table in db
	function submitDecision() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
  		if ($mysqli->connect_errno) {
  			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
  		}

  		//escape, remove special characters, and format appropriately - watch messageBody, not sure about this
  		$originUserID = $mysqli->real_escape_string(htmlspecialchars($_POST["originID"]));
  		$targetUserID = $mysqli->real_escape_string(htmlspecialchars($_POST["targetID"]));
  		$decision = (int)$mysqli->real_escape_string(htmlspecialchars($_POST["decision"]));

		//check if any decision has been made between those users
		$query = "	SELECT * FROM user_decisions WHERE 
					(origin_user_id = ? AND target_user_id = ?) OR 
					(origin_user_id = ? AND target_user_id = ?)";

		//prepare statement and handle error
		$stmt = $mysqli->prepare($query);

		//bind email to query and execute
		$stmt->bind_param("ssss", $originUserID, $targetUserID, $targetUserID, $originUserID);
		if (!$stmt->execute()) {
			$response = ["status" => "error1"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result, and if row exists
		$result = $stmt->get_result();
		$row = $result->fetch_assoc();
		$exists = $result->num_rows;
		//free memory
		$result->free();

		//if a row exists, this means our user = target_user_id in database as a result of someone else's decision
		if ($exists > 0) {
			$query = "	UPDATE user_decisions
						SET target_user_choice = ? 
						WHERE (origin_user_id = ? AND target_user_id = ?)";

			//prepare statement and handle error
			$stmt = $mysqli->prepare($query);

			//bind choice to query and execute
			$stmt->bind_param("iss", $decision, $targetUserID, $originUserID);
			if (!$stmt->execute()) {
				$response = ["status" => "error"];
  				$mysqli->close();
  				echo json_encode($response);
  				return;
			} else {
				//check both decisions
				$targetDecision = (int)$row["origin_user_choice"];

				//if there is a match, add to message counter and respond with id 
				if (($decision == 1) && ($targetDecision == 1)) {
					//get current date
					$date = date("Y-m-d H:i:s");

					//query for match insertion
					$query = "	INSERT INTO message_counter (user_id_1, user_id_2, date_time) 
								VALUES (?, ?, ?)";

					//prepare statement and handle error
					$stmt = $mysqli->prepare($query);

					//bind choice to query and execute
					$stmt->bind_param("sss", $originUserID, $targetUserID, $date);
					if (!$stmt->execute()) {
						$response = ["status" => "error"];
  						$mysqli->close();
  						echo json_encode($response);
  						return;
					}
					//respond with match and id 
					$response = ["status" => "match"];

				} else {
					//respond with success
					$response = ["status" => $targetDecision];
				}	

				$mysqli->close();
  				echo json_encode($response);
  				return;
			}

		} elseif ($exists == 0) {
			$query = "	INSERT INTO user_decisions (origin_user_id, origin_user_choice, target_user_id) 
						VALUES (?, ?, ?)";

			//prepare statement and handle error
			$stmt = $mysqli->prepare($query);

			//bind ids and decision to query and execute
			$stmt->bind_param("sis", $originUserID, $decision, $targetUserID);
			if (!$stmt->execute()) {
				$response = ["status" => "error"];
  				$mysqli->close();
  				echo json_encode($response);
  				return;
			} else {
				//successfully entered, end
				$response = ["status" => "success"];
  				$mysqli->close();
  				echo json_encode($response);
  				return;
			}
		}
	}



?>