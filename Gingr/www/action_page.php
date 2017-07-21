<?php

session_start();

// define variables and set to empty values
$username = $password = "";
$usernameErr = $passwordErr = '';

//check input and trim
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
	if (empty($_POST['username'])) {
    	$usernameErr = 'Username is required';
  	} else {
    	$username = test_input($_POST['username']);
  	}

  	if (empty($_POST['password'])) {
  		$passwordErr = 'Email is required';
  	} else {
    	$password = test_input($_POST['password']);
  	}
}

//start session
if ($_POST['username'] == 'phil') {
	$_SESSION['valid'] = true;
	$_SESSION['username'] = 'phil';
	header( 'Location: index.php' );
}



//function to trim and test form input
function test_input($data) {
  	$data = trim($data);
  	$data = stripslashes($data);
  	$data = htmlspecialchars($data);
  	return $data;
}

?>