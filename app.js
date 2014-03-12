// Setup:
// Install git and node
// sudo npm install jitsu -g
// git clone https://github.com/OpenUserJs/OpenUserJS.org.git
// cd OpenUserJS.org
// jitsu login
// Copy this file into the directory
// node app.js &

var express = require('express');
var spawn = require('child_process').spawn;
var app = express();
var ghPath = 'OpenUserJs/OpenUserJS.org';

app.configure(function(){
  app.use(express.urlencoded());
  app.use(express.json());
  app.use(express.methodOverride());
  app.use(app.router);
});

app.listen(7070);

app.post('/', function (req, res) {
  var payload = null;
  var username = null;
  var reponame = null;
  var git = null;
  var jitsu = null;

  res.end(); // close connection

  // Test for know GH webhook ips: https://api.github.com/meta
  if (!req.body.payload ||
    !/192\.30\.252\.(2[0-5][0-5]|1[0-9]{2}|[1-9]?\d)/
    .test(req.headers['x-forwarded-for'] || req.connection.remoteAddress)) {
    return; 
  }

  payload = JSON.parse(req.body.payload);

  // Only accept commits to the master branch
  if (!payload || payload.ref !== 'refs/heads/master') { return; }

  // Make sure we have the right repo
  username = payload.repository.owner.name;
  reponame = payload.repository.name;

  if (ghPath === username + '/' + reponame) {
    // git pull origin master
    // jitsu deploy
    git = spawn('git', ['pull', 'origin', 'master']);
    git.on('close', function (code) {
      jitsu = spawn('jitsu', ['deploy']);
      jitsu.on('close', function(code) {
        return;
      });
    });
  }
});

