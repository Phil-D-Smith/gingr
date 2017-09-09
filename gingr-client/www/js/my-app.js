// Initialize app
var myApp = new Framework7();


// If we need to use custom DOM library, let's save it to $$ variable:
var $$ = Dom7;

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

    //load login page on startup
    mainView.router.loadPage("login.html");



    //on touch of a match, load those messages
    $(document).on("touchend", ".back-matches", function(e) {
        e.preventDefault();
        console.log("back clicked");

        //mainView.router.loadPage("matches.html");
    }); 

});






// Now we need to run the code that will be executed only for About page.

// Option 1. Using page callback for page (for "about" page in this case) (recommended way):
myApp.onPageInit('profile', function(page) {
    console.log("profile loaded");
    // Do something here for "about" page
})


//close panel when link pressed
$$('.panel-close').on('click', function (e) {
    //close panel
    myApp.closePanel();
});


function onLocationSuccess(position) {
    var latitude = position.coords.latitude*1000000;
    var longitude = position.coords.longitude*1000000;
    var accuracy = position.coords.accuracy*1000000;

    console.log(latitude + " " + longitude);
}

function onLocationError(error) {
    console.log("GPS error");
    console.log(error.message);
}