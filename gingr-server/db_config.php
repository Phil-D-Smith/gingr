<?php
	//database info
	define('DB_SERVER', 'localhost');
   	define('DB_USERNAME', 'root');
	define('DB_PASSWORD', '');
	define('DB_NAME', 'test');

	
	//turn off error reporting because PHP appends it to the end of JSON responses like a spoon
  	error_reporting(0);
	@ini_set('display_errors', 0);
?>