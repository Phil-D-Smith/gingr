// Initialize app
var myApp = new Framework7({
    template7Pages: true,
});

// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

var server = "http://127.0.0.1:8000/gingr_server/";
var wsServer = "ws://127.0.0.1:8000/";
var currentPage = null;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we want to use dynamic navbar, we need to enable it for this view:
    dynamicNavbar: true
});

// Handle Cordova Device Ready Event
$$(document).on('deviceready', function() {
    console.log("Device is ready!");
    //modify status bar
    StatusBar.styleBlackTranslucent;

    //load login page on startup, if user already signed in, verify and skip
    if ($.trim(window.localStorage.getItem("id")).length > 0) {
        verifyUser()
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


/*
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
*/

//close panel when link pressed
$$('.panel-close').on('click', function (e) {
    //close panel
    myApp.closePanel();
});

//gps callbacks
function updateLocation() {
    //get position on startup - 10s timeout
    navigator.geolocation.getCurrentPosition(onLocationSuccess, onLocationError, {timeout:10000});
}

function onLocationSuccess(position) {
    window.localStorage.setItem("latitude", position.coords.latitude);
    window.localStorage.setItem("longitude", position.coords.longitude);
    window.localStorage.setItem("accuracy", position.coords.accuracy);

    console.log(latitude + ", " + longitude);
}

function onLocationError(error) {
    console.log("GPS error");
    console.log(error.message);
}