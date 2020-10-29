require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');

const app = express();

function padNumber(num) {
  if (num > 9) return num.toString();
  else return ("0" + num.toString());
}

function getFormatedDate() {
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



//app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
app.use(bodyParser.json());

mongoose.connect(proccess.env.mongoConnectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const scoreSchema = new mongoose.Schema({
  user: String,
  score: Number,
  day: String,
  hour: String
});

const Score = mongoose.model("Score", scoreSchema);


app.get("/", function(req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/get-scores", function(req, res) {
  // var scores;
  Score.find({}, function(err, results) {
    if (!err) {
      let toSend = "";
      for (let i = 0; i < results.length; i++) {
        let temp = {
          user: results[i].user,
          score: results[i].score,
          date: results[i].hour + " " + results[i].day,
        }
        toSend += (JSON.stringify(temp) + "\n");

      }
      res.send(toSend);
    }
  }).sort([
    ["score", "desc"]
  ]).limit(10);

});

app.get("/get-scores-daily", function(req, res) {
  Score.find({
    "day": getFormatedDate().split(" ")[0]
  }, function(err, results) {
    if (err) return;
    toSend="";
    for (let i = 0; i < results.length; i++) {
      let temp = {
        user: results[i].user,
        score: results[i].score,
        hour: results[i].hour,
      }
      toSend += (JSON.stringify(temp) + "\n");
    }
    res.send(toSend);

  }).sort([
    ["score", "desc"]
  ]).limit(10);
});

app.get("/get-count", function(req, res) {
  Score.find({}, function(err, results) {
    if (!err) {
      var count = results.length;
      res.send(count.toString());
    }
  })
});
app.get("/get-day-count", function(req, res) {
  Score.find({"day": getFormatedDate().split(" ")[0]}, function(err, results) {
    if (!err) {
      var count = results.length;
      res.send(count.toString());
    }
  });
});
app.post("/submit-score", function(req, res) {
  const score = new Score({
    user: req.body.user,
    score: req.body.score,
    day: req.body.date.split(" ")[0],
    hour: req.body.date.split(" ")[1]
  });
  score.save().then(() => res.redirect("/"));

});


app.listen(process.env.PORT || 3000, function() {

})
