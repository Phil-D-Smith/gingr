<?php
	header("access-control-allow-origin: *");
	header("access-control-allow-methods: GET, POST, PATCH, PUT, DELETE, OPTIONS");
	header("access-control-allow-headers: X-Requested-With, Content-Type");

	//include databse info
	require_once "db_config.php";

	function getMessages {
		$nothing = 0;
	}

	function sendMessage {
		$nothing = 0;
	}

	function receieveMessage {
		
	}


  	//escape, remove special characters, and format appropriately
  	$originUserID = $mysqli->real_escape_string(htmlspecialchars($_POST["id"]));
  	$targetUserID = $mysqli->real_escape_string(htmlspecialchars($_POST["message"]));
	$message = $mysqli->real_escape_string(htmlspecialchars($_POST["message"]));
	$date = date("Y-m-d H:i:s");

	//find current message count for conversation
	$messageCount = $mysqli->query("	SELECT message_count FROM message_counter 
										WHERE  ((user_id_1 = '$originUserID' AND user_id_2 = '$targetUserID') 
										OR (user_id_1 = '$targetUserID' AND user_id_2 = '$originUserID'))");
	//if count = 0
	//else, get message_count

		if ($messageCount == 0) {
		} else {

		}


?>