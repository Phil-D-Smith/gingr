<?php 
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	header('Content-Type: application/json');

	//include databse info
	require_once "db_config.php";

	if($_POST['action'] == "getMessages") {
		getMessages();
	}

	if($_POST['action'] == "sendMessage") {
		sendMessage();
	}

	if($_POST['action'] == "checkMessages") {
		checkMessages();
	}


	//gets ALL messages from db for a conversation
	function getMessages() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
  		if ($mysqli->connect_errno) {
  			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
  		}


  		//escape, remove special characters, and format appropriately
  		$matchID = $mysqli->real_escape_string(htmlspecialchars($_POST["matchID"]));
  		$originUserID = $mysqli->real_escape_string(htmlspecialchars($_POST["userID"]));
		//for "last updated" note on messages
		$date = date("Y-m-d H:i:s");



		//find current match id and message count for conversation
		$query = "SELECT user_id_1, user_id_2, message_count FROM message_counter WHERE match_id = ?";

		//prepare statement and handle error
		$stmt = $mysqli->prepare($query);

		//bind email to query and execute
		$stmt->bind_param("i", $matchID);
		if (!$stmt->execute()) {
			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result
		$result = $stmt->get_result();
		$row = $result->fetch_assoc();
		$userID1 = $row["user_id_1"];
		$userID2 = $row["user_id_2"];
		$messageCount = $row["message_count"];

		//if no messages exit, else continue
		if ($messageCount == 0) {
			$response = ["status" => "empty"];
		} else {
			//free memory
			$result->free();

			//update last_seen message counter to the total message counter
			if ($originUserID === $userID1) {
				$query = "	UPDATE message_counter
							SET last_seen_user_1 = ?
							WHERE match_id = ?";
			} elseif ($originUserID === $userID2) {
				$query = "	UPDATE message_counter
							SET last_seen_user_2 = ?
							WHERE match_id = ?";
			}

			//some kind of error catching here - if not - reutrn and respond with error
			//prepare statement and handle error
			$stmt = $mysqli->prepare($query);

			//bind email to query and execute
			$stmt->bind_param("ii", $messageCount, $matchID);
			if (!$stmt->execute()) {
				$response = ["status" => "error"];
  				$mysqli->close();
  				echo json_encode($response);
  				return;
			}


			//get all messages for that match
			$query = "SELECT all_messages.* FROM all_messages WHERE match_id = ?";

			//prepare statement and handle error
			$stmt = $mysqli->prepare($query);

			//bind email to query and execute
			$stmt->bind_param("i", $matchID);
			if (!$stmt->execute()) {
				$response = ["status" => "error"];
  				$mysqli->close();
  				echo json_encode($response);
  				return;
			}

			//get result
			$result = $stmt->get_result();

			//array of arrays of message data
			$allMessages = [];

			//loop through all messages in table
			$i = 0;
			while ($row = $result->fetch_assoc()) {

				$dateTime = $row["date_time"];
				$messageNumber = $row["message_number"];
				$messageBody = stripslashes($row["message_body"]);
				$senderID = $row["sender_id"];

				//message array for each message
    			$messageData = ["dateTime" => $dateTime,
    							"messageNumber" => $messageNumber,
    							"messageBody" => $messageBody,
    							"senderID" => $senderID];

    			//put in another array for response
    			$allMessages[$i] = $messageData;
				$i++;
			}
		}
		//free memory
		$result->free();

		//{status, count, {message1, message2...}}
		$response = [	"status" => "success",
						"messageCount" => $messageCount,
						"messages" => $allMessages];

		//close and respond
		$mysqli->close();
		echo json_encode($response);
	}

	//sends a message to db for a conversation
	function sendMessage() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
  		if ($mysqli->connect_errno) {
  			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
  		}


  		//escape, remove special characters, and format appropriately - watch messageBody, not sure about this
  		$matchID = $mysqli->real_escape_string(htmlspecialchars($_POST["matchID"]));
  		$senderID = $mysqli->real_escape_string(htmlspecialchars($_POST["senderID"]));
  		$messageBody = $mysqli->real_escape_string(htmlspecialchars($_POST["messageBody"]));

		$dateTime = date("Y-m-d H:i:s");



		//find current message count for that match id
		$query = "SELECT user_id_1, user_id_2, message_count FROM message_counter WHERE match_id = ?";

		//prepare statement and handle error
		$stmt = $mysqli->prepare($query);

		//bind email to query and execute
		$stmt->bind_param("i", $matchID);
		if (!$stmt->execute()) {
			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
		}

		//get result
		$result = $stmt->get_result();
		$row = $result->fetch_assoc();
		$userID1 = $row["user_id_1"];
		$userID2 = $row["user_id_2"];
		$messageCount = $row["message_count"];
		//free memory
		$result->free();

		$newMessageCount = $messageCount + 1;
		
		//query for messageCount update to both counters (sending a message assumes you are reading them all)
		if ($senderID === $userID1) {
			$query = "	UPDATE message_counter
						SET message_count = ?, last_seen_user_1 = ?, last_message = ?, date_time = ?
						WHERE match_id = ?";
		} elseif ($senderID === $userID2) {
			$query = "	UPDATE message_counter
						SET message_count = ?, last_seen_user_2 = ?, last_message = ?, date_time = ?
						WHERE match_id = ?";
		}

		//prepare statement and handle error
		$stmt = $mysqli->prepare($query);

		//bind email to query and execute
		$stmt->bind_param("iissi", $newMessageCount, $newMessageCount, $messageBody, $dateTime, $matchID);
		//if successful, continue to insert new message
		if ($stmt->execute()) {
			$response = ["status" => "success"];

			//query for message insertion
			$query = "	INSERT INTO all_messages (match_id, date_time, message_number, message_body, sender_id)
						VALUES (?, ?, ?, ?, ?)";

			//prepare statement and handle error
			$stmt = $mysqli->prepare($query);

			//bind email to query and execute
			$stmt->bind_param("isiss", $matchID, $dateTime, $newMessageCount, $messageBody, $senderID);
			//if successful, continue to insert new message
			if ($stmt->execute()) {
				$response = [	"status" => "success",
								"messageCount" => $newMessageCount];
			} else {
				$response = ["status" => "error"];
			}

		} else {
			$response = ["status" => "error"];
		}

		//close and respond
		$mysqli->close();

		echo json_encode($response);
	}

	//checks for any new messages- similar to getMessages but only appends new ones, called periodically by client
	function checkMessages() {
		//create database object
		$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME);
  		if ($mysqli->connect_errno) {
  			$response = ["status" => "error"];
  			$mysqli->close();
  			echo json_encode($response);
  			return;
  		}

  		//escape, remove special characters, and format appropriately
  		$originUserID = $mysqli->real_escape_string(htmlspecialchars($_POST["originID"]));
  		$currentPage = $mysqli->real_escape_string(htmlspecialchars($_POST["currentPage"]));
  		$pageMatchID = (int)$mysqli->real_escape_string(htmlspecialchars($_POST["matchID"]));
		//for "last updated" note on messages
		$date = date("Y-m-d H:i:s");

		//find number of matches
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

		//get result and number of matches for that user
		$matchResult = $stmt->get_result();
		$numMatches = $matchResult->num_rows;

		//array of arrays of message data
		$allMatchMessages = [];
		$newMessages = 0;

		//loop through and check new messages for all matches
		$i =0;
		while($matchRow = $matchResult->fetch_assoc()) {
			$matchID = (int)$matchRow["match_id"];
			$userID1 = $matchRow["user_id_1"];
			$userID2 = $matchRow["user_id_2"];
			$currentMessageCount = (int)$matchRow["message_count"];
			$lastSeen1 = (int)$matchRow["last_seen_user_1"];
			$lastSeen2 = (int)$matchRow["last_seen_user_2"];

			//find the last seen message for the client user
			if ($originUserID === $userID1) {
				$lastMessageCount = $lastSeen1;
			} elseif ($originUserID === $userID2) {
				$lastMessageCount = $lastSeen2;
			}

			//if new messages - get them, else - skip
			if ($currentMessageCount > $lastMessageCount) {
				$newMessages = $newMessages+1;

				//if on the conversation page FOR THAT USER, update the relevant last_seen counter
				if (($currentPage === "conversation") && ($matchID === $pageMatchID)) {
					
					//update last_seen message counter to the total message counter
					if ($originUserID === $userID1) {
						$updateQuery = "	UPDATE message_counter
											SET last_seen_user_1 = ?
											WHERE match_id = ?";
					} elseif ($originUserID === $userID2) {
						$updateQuery = "	UPDATE message_counter
											SET last_seen_user_2 = ?
											WHERE match_id = ?";
					}

					//prepare statement and handle error
					$updateStmt = $mysqli->prepare($updateQuery);

					//bind email to query and execute
					$updateStmt->bind_param("ii", $currentMessageCount, $matchID);
					if (!$updateStmt->execute()) {
						$response = ["status" => "error"];
  						$mysqli->close();
  						echo json_encode($response);
  						return;
					}

				}

				//get NEW messages for that match
				$query = "	SELECT * FROM all_messages
							WHERE match_id = ? 
							AND message_number > ?";

				//prepare statement and handle error
				$stmt = $mysqli->prepare($query);

				//bind email to query and execute
				$stmt->bind_param("ii", $matchID, $lastMessageCount);
				if (!$stmt->execute()) {
					$response = ["status" => "error"];
  					$mysqli->close();
  					echo json_encode($response);
  					return;
				}

				//get result and number of matches for that user
				$result = $stmt->get_result();

				//loop through all messages in table
				$j = 0;
				$allMessages = [];
				while ($row = $result->fetch_assoc()) {
					$dateTime = $row["date_time"];
					$messageNumber = $row["message_number"];
					$messageBody = stripslashes($row["message_body"]);
					$senderID = $row["sender_id"];

					//message array for each message
    				$messageData = ["dateTime" => $dateTime,
    								"messageNumber" => $messageNumber,
    								"currentMessageCount" => $currentMessageCount,
    								"lastMessageCount" => $lastMessageCount,
    								"messageBody" => $messageBody,
    								"matchID" => $matchID,
    								"senderID" => $senderID];

    				//put in another array for response
    				$allMessages[$j] = $messageData;
					$j++;
				}
				//free memory
				$result->free();

				//put each message set into array for each user
				$allMatchMessages[$matchID] = $allMessages;

			} elseif ($currentMessageCount === $lastMessageCount) {
				$newMessages = $newMessages;
			}

			$i++;
		}

		//{status, number matches, {message1, message2...}}
		$response = [	"status" => "success",
						"newMessages" => $newMessages,
						"numMatches" => $numMatches,
						"messages" => $allMatchMessages];
		

		//close and respond
		$mysqli->close();
		echo json_encode($response);
	}


 ?>