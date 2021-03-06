// Initialize app
var myApp = new Framework7({
     template7Pages: true
});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var server = "http://gingr-server.com";
var currentPage = null;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");

    //get position on startup - 10s timeout
    navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError, {timeout:10000});

    //modify status bar
    StatusBar.styleBlackTranslucent;

    //load login page on startup, if user already signed in, skip
    if (localStorage.id) {
        verifyUser();
    } else {
        mainView.router.loadPage("login.html");
    }


    //on touch of a back button - ignore?
    $(document).on("touchend", ".back-matches", function(e) {
        e.preventDefault();
        console.log("back clicked");

        //mainView.router.loadPage("matches.html");
    }); 
});




//if change page, stop loading them
myApp.onPageInit('login', function(page) {
     clearInterval(matchCheck);
});
myApp.onPageInit('preferences', function(page) {
     clearInterval(matchCheck);
});
myApp.onPageInit('profile', function(page) {
     clearInterval(matchCheck);
});
myApp.onPageInit('editProfile', function(page) {
     clearInterval(matchCheck);
});
myApp.onPageInit('targetProfile', function(page) {
     clearInterval(matchCheck);
});
myApp.onPageInit('settings', function(page) {
     clearInterval(matchCheck);
});
myApp.onPageInit('preferences', function(page) {
     clearInterval(matchCheck);
});
myApp.onPageInit('conversation', function(page) {
     clearInterval(matchCheck);
});
myApp.onPageInit('matches', function(page) {
     clearInterval(matchCheck);
});





//close panel when link pressed
$$('.panel-close').on('click', function (e) {
    //close panel
    myApp.closePanel();
});



function onLocationSuccess(position) {
    var latitude = position.coords.latitude*1000000;
    var longitude = position.coords.longitude*1000000;
    var accuracy = position.coords.accuracy*1000000;

    console.log(latitude + ", " + longitude);
}

function onLocationError(error) {
    console.log("GPS error");
    console.log(error.message);
}