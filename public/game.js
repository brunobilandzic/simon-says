var colors = ["green", "red", "yellow", "blue"];
var showInterval = 200;
var clickInterval = 80;
var toClick = [];
var clicked = [];
var justNow = null;
var game = true;
var restart = false;
var glo_score = 0;
var colourToClick = null;
function getScores(){
  let xhr = new XMLHttpRequest();
  var response = null;
  xhr.open("GET" , "/get-scores");
  xhr.onload = function (){
    response = this.responseText;
    makeTable(response);
  }
  xhr.send();
}
function getDailyscores(){
  let xhr = new XMLHttpRequest();
  var response = null;
  xhr.open("GET" , "/get-scores-daily");
  xhr.onload = function (){
    response = this.responseText;
    makeTableDaily(response);
  }
  xhr.send();
}

function makeTable(response){
  response = response.split("\n").filter(x => x!="");
  for(let i = 0; i< response.length; i++){
     response[i] = JSON.parse(response[i]);
   }

  for(let i=0; i<response.length && i<10; i++){
    $("#" + (i+1)).html("<td>" + response[i].user + "</td>" +"<td>" + response[i].score + "</td>" +"<td>" + response[i].date + "</td>");
  }
}
function makeTableDaily(response){
  response = response.split("\n").filter(x => x!="");
  for(let i = 0; i< response.length; i++){
     response[i] = JSON.parse(response[i]);
   }

  for(let i=0; i<response.length && i<10; i++){
    $("#d" + (i+1)).html("<td>" + response[i].user + "</td>" +"<td>" + response[i].score + "</td>" +"<td>" + response[i].hour + "</td>");
  }
}



function getCount(){
  let xhr = new XMLHttpRequest();
  var response = null;
  xhr.open("GET" , "/get-count");
  xhr.onload = function (){
    response = this.responseText;
    console.log(this.responseText);
    $("#count").text(response);
  }
  xhr.send();
}
function getDayCount(){
  let xhr = new XMLHttpRequest();
  var response = null;
  xhr.open("GET" , "/get-day-count");
  xhr.onload = function (){
    response = this.responseText;
    console.log(this.responseText);
    $("#day-count").text(response);
  }
  xhr.send();

}
function nextColorID() {
  return "#" + colors[Math.floor(Math.random() * colors.length)];
}

function playAudio(audioID) {
  audio = new Audio("sounds/" + audioID + ".mp3");
  audio.play()
}

function getLevel() {
  return toClick.length;
}

function setTitle() {
  $("#level-title").text("Level " + getLevel());
}

function check() {
  if(toClick[clicked.length-1]!=clicked[clicked.length-1])
    return false;
  else
    return true;
  // for (let i = 0; i < clicked.length; i++) {
  //   if (toClick[i] != clicked[i])
  //     return false;
  // }
  // return true;
}

function padNumber(num){
  if (num>9) return num.toString();
  else return ("0" + num.toString());
}

function getFormatedDate(){
  let date = new Date();
  let localTime = date.getTime();
  let localOffset = date.getTimezoneOffset() * 60000;
  let utcTime = localTime + localOffset;
  let gmtTime = utcTime + (120 * 60000);
  date = new Date(gmtTime);
  let day = padNumber(date.getDate());
  let month = padNumber(date.getMonth() + 1);
  let year = padNumber(date.getFullYear());
  let hour = padNumber(date.getHours());
  let minutes = padNumber(date.getMinutes());
  let seconds = padNumber(date.getSeconds());
  let dateString = day + "-" + month + "-" + year + " " + hour + ":" + minutes + ":" + seconds;
  return dateString;

}


function highlightButton(buttonID, interval) {
  audioID = buttonID.slice(1, buttonID.length);
  playAudio(audioID);
  $(buttonID).addClass("pressed");
  setTimeout(function() {
    $(buttonID).removeClass("pressed");
  }, interval);
}

function setNextButton() {
  setTimeout(function() {
    toClick.push(nextColorID());
    setTitle();
    let b = toClick[toClick.length - 1];
    playAudio(b.slice(1, b.length));
    $(b).fadeIn(100).fadeOut(100).fadeIn(100);

  }, 1000);

}

function addKeyDown() {
  $("#level-title").text("Press to Start");
  $(".btn").off("click");
  $(".container").on("click", function(e) {
    setNextButton();
    setTitle();
    $(".container").off("click");
    $(".container").off("keydown");
    e.stopPropagation();
    $(".btn").on("click",handleButtonClick);
  });
  $(".container").on("keydown", function(e) {
    setNextButton();
    setTitle();
    $(".container").off("keydown");
    $(".container").off("click");
    e.stopPropagation();
    $(".btn").on("click",handleButtonClick);
  });
}

function bodyRed(){
  $("body").addClass("red");
  setTimeout(function () {
    $("body").removeClass("red");
  }, 1000);
}
function gameOver() {
  bodyRed();
  glo_score = toClick.length-1;
  playAudio("wrong");
  console.log(toClick);
  console.log(clicked);
  colourToClick = toClick[clicked.length-1].slice(1,toClick[clicked.length-1].length);
  $(".had-to-press").text(colourToClick);
  $(".had-to-press").addClass("text-" + colourToClick);
  toClick = [];
  clicked = [];
  $(".score").text(glo_score);
  $(".score-container").removeClass("hidden");
}

$(".submit-btn").on("click", function(e){
  var username = $("#user-name-input").val().split("").filter(x => x.match(/\w/i)).join("").slice(0,15);
  if (username ==""){
    username = "unknown" + Math.floor((Math.random() * 20) + 1).toString();
  }

  var date = getFormatedDate();
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/submit-score");
  xhr.setRequestHeader('Content-Type', 'application/json');
  var data = {
    user: username,
    score: glo_score,
    date: date
  }
  xhr.send(JSON.stringify(data));


  setTimeout(() =>{
    getCount();
    getScores();
    getDailyscores();
    getDayCount();
  }, 2000);


  $("#user-name-input").attr("value", "");
  $(".score-container").addClass("hidden");
  $(".had-to-press").removeClass("text-" + colourToClick);

  getScores();
  getCount();
  e.stopPropagation();
  addKeyDown();
});

$(".play-again-btn").on("click",function(e){
  $(".score-container").addClass("hidden");
  $(".had-to-press").removeClass("text-" + colourToClick);
  e.stopPropagation();
  addKeyDown();
});

function handleButtonClick(event){
  let clickedID = "#" + event.target.id;
  clicked.push(clickedID);
  highlightButton(clickedID, clickInterval);
  if (check()) {
    if(clicked.length==toClick.length){
      clicked = [];
      setNextButton();
    }
  } else if (!check()) {
    gameOver();
  }
}

$(".info-button").on("click", function(){
  $(".info-container").removeClass("hidden");
  $(".container").off("keydown");
  $(".container").off("click");
})
$(".cancel-info-btn").on("click", function(e){
  $(".info-container").addClass("hidden");
  e.stopPropagation();
  addKeyDown();
})
$(".btn").on("click",handleButtonClick);

addKeyDown();
getScores();
getCount();
getDailyscores();
getDayCount();
