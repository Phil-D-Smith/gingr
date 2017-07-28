<?php
	header("access-control-allow-origin: *");

	include("config.php");

	if(isset($_POST['signup'])) {
		$firstname=mysql_real_escape_string(htmlspecialchars(trim($_POST['firstname'])));
		$lastname=mysql_real_escape_string(htmlspecialchars(trim($_POST['lastname'])));
		$email=mysql_real_escape_string(htmlspecialchars(trim($_POST['email'])));
		$password=mysql_real_escape_string(htmlspecialchars(trim($_POST['password'])));

		$login=mysql_num_rows(mysql_query("SELECT * FROM 'phonegap_login' WHERE 'email'='$email'"));
		if($login!=0) {
			echo "exist";
		}else {
			$date=date("y-m-d h:m:s");
			$q=mysql_query("insert into 'user_table' ('reg_date','firstname','lastname','email','password') values ('$date','$fullname','$email','$password')");
			if($q) {
				echo "success";
			}else {
				echo "failed";
			}
		}
		echo mysql_error();
	}

?>