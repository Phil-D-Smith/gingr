<?php
	//database info
	define('DB_SERVER', 'localhost');
   	define('DB_USERNAME', 'root');
	define('DB_PASSWORD', '');
	define('DB_NAME', 'test');

	//create database object
	$mysqli = new mysqli(DB_SERVER, DB_USERNAME, DB_PASSWORD, DB_NAME)
  	or die('Error connecting to database');
?>