var audio = new Audio('assets/beeping.mp3');

// require('handlebars');

function Timer(id) {
	this.startTime = 0;
    this.endTime = 0;
    this.timerDuration = 0;
    this.id = id;
    this.timerFunction;
} //Timer

function TimerList() {
    this.timerListArr = [];
    var timerCounter = 0;

    this.addTimer = function() {
        //Initialize timer ID, increment counter, create Handlebars JSON
        var timerId = timerCounter.toString();
        timerCounter++;
        var timerData = {
            timerId: timerId
        };

        //Create/push timer to array and add timer content to DOM using Handlebars template and animate
        var newTimer = new Timer(timerId);
        this.timerListArr.push(newTimer);
        $("#timers").append(timerTemplate(timerData));
        $("div[timerId=" + timerId + "]").css("opacity", 0)
            .slideDown("fast")
            .animate({
                opacity: 1,
                easing: "linear",
                queue: false,
                duration: 300
            });

        //Trigger binding to new timer
        this.triggerBindings("div[timerId=" + timerId + "]");
    }; //addTimer

    this.removeTimer = function(event) {
        //Get timer ID and index
        var timerData = this.findTimer(event);
        var timerId = timerData[0];
        var timerIndex = timerData[1];

        //Remove the timer from the array and the element from DOM
        $("div[timerId=" + timerId + "]").animate({
            opacity: 0
        }, {
            duration: 200,
            complete: function() {
                $("div[timerId=" + timerId + "]").slideUp();
            }
        });

        //Remove timer from array
        this.timerListArr.splice(timerData[1], 1);
    }; //removeTimer

    this.triggerBindings = function(selector) {
        //Bind event listeners to UI controls
        $(selector).on("click", "i.fa-times", function(event) {
            pageTimers.removeTimer(event);
        });
        $(selector).on("click", "i.fa-plus-circle", function(event) {
            pageTimers.addMinute(event);
        });
        $(selector).on("click", "i.fa-minus-circle", function(event) {
            pageTimers.removeMinute(event);
        });
        $(selector).on("click", "i.fa-refresh", function(event) {
            pageTimers.resetTimer(event);
        });
        $(selector).on("click", "i.fa-play-circle", function(event) {
            pageTimers.playPause(event);
        });
        $(selector).on("click", "i.fa-pause-circle", function(event) {
            pageTimers.playPause(event);
        });
    };

    /*
    Searches the array for the entry matching the ID obtained from
    the parent div, and then returns the id and the array
    index of the timer in an array.
    */
    this.findTimer = function(event) {
        var timerId = $(event.target).parent().parent().attr("timerId");
        for (var i = 0; i < this.timerListArr.length; i++) {
            if (this.timerListArr[i].id === timerId) {
                return [timerId, i];
            }
        }
    }; //findTimer

    /*
    Adds 60 seconds to the timer and triggers an update of the UI.
    */
    this.addMinute = function(event) {
        var timerIndex = this.findTimer(event)[1];
        this.timerListArr[timerIndex].timerDuration += 60000;
        $(event.target).parent().parent().find("span").html(this.printTime(this.timerListArr[timerIndex].timerDuration));
    }; //addMinute

    /*
    Removes 60 seconds from the timer if time is over 60 seconds. If less than
    60 seconds, reduces to 0. If 0, prompt the user. Updates the UI.
    */
    this.removeMinute = function(event) {
        var timerIndex = this.findTimer(event)[1];
        var currentTimerTime = this.timerListArr[timerIndex].timerDuration;
        if (currentTimerTime > 60000) {
            this.timerListArr[timerIndex].timerDuration -= 60000;
        } else if (currentTimerTime > 0 && currentTimerTime <= 60000) {
            this.timerListArr[timerIndex].timerDuration = 0;
        } else {
            alert("Timer already set to zero.");
        }
        $(event.target).parent().parent().find("span").html(
            this.printTime(this.timerListArr[timerIndex].timerDuration));
    }; //removeMinute

    this.resetTimer = function(event) {
        var timerIndex = this.findTimer(event)[1];
        this.timerListArr[timerIndex].timerDuration = 0;
        $(event.target).parent().parent().find("span").html(
            this.printTime(this.timerListArr[timerIndex].timerDuration));
    }; //resetTimer

    /*
    Formats the time from seconds to minutes/seconds.
    */
    this.printTime = function(timeInMS) {
        var time = Math.round(timeInMS / 1000);
        var seconds = time % 60;
        var minutes = (time - seconds) / 60;
        if (minutes < 10) {
            minutes = "0" + minutes;
        }
        if (seconds < 10) {
            seconds = "0" + seconds;
        }
        return minutes.toString() + ":" + seconds.toString();
    }; //printTime

    /*
    Handles behavior of play/pause button. If starting the timer, changes the button to "Pause"
    and initalizes timer with setInterval. If pausing the timer, changes button to "Play"
    and calls clearInterval.
    */
    this.playPause = function(event) {
        var timerIndex = this.findTimer(event)[1];
        if ($(event.target).hasClass("fa-play-circle")) {
            $(event.target).removeClass("fa-play-circle");
            $(event.target).addClass("fa-pause-circle");
            this.triggerBindings();
            pageTimers.timerListArr[timerIndex].endTime = Date.now() + pageTimers.timerListArr[timerIndex].timerDuration;
            this.timerListArr[timerIndex].timerFunction = setInterval(function() {
				var timeRemaining = Math.round((pageTimers.timerListArr[timerIndex].endTime - Date.now()) / 1000) * 1000;
                if (timeRemaining > 1) {
                    $(event.target).parent().parent().find("span").html(pageTimers.printTime(timeRemaining));
					pageTimers.timerListArr[timerIndex].timerDuration = timeRemaining;
                } else if (timeRemaining <= 1) {
                    audio.play();
                    // playSound();
                    pageTimers.timerListArr[timerIndex].timerDuration = 0;
                    var timerName = $(event.target).parent().parent().find("input").val();
					var timerAlertData = {
                        timerName: timerName
                    };
                    //$("#timers").append(timerAlertTemplate(timerAlertData));
                    //$("#timer" + timerName + "Alert").dialog();
                    $(event.target).parent().parent().find("span").html(pageTimers.printTime(0));
                    alert("Timer " + timerName + " expired!");
                    $(event.target).removeClass("fa-pause-circle");
                    $(event.target).addClass("fa-play-circle");
                    pageTimers.triggerBindings();
					clearInterval(pageTimers.timerListArr[timerIndex].timerFunction);
                }
            }, 999);
        } else {
            clearInterval(this.timerListArr[timerIndex].timerFunction);
            $(event.target).removeClass("fa-pause-circle");
            $(event.target).addClass("fa-play-circle");
            pageTimers.resetTimer(event);
        }
    }; //playPause

} //TimerList

//Gets and compiles the Handlebars template for new timers
var timerTemplateSource = $("#timerTemplate").html();
var timerTemplate = Handlebars.compile(timerTemplateSource);

//Gets and compiles the Handlebars template for timer alerts
var timerAlertSource = $("#timerAlertTemplate").html();
var timerAlertTemplate = Handlebars.compile(timerAlertSource);

//Creates the new TimerList and binds addTimer() to the "Add" button
var pageTimers = new TimerList();
$("#addTimerBtn").on("click", function() {
    pageTimers.addTimer();
});




// function playSound() {
//     createjs.Sound.play(soundID);
// }