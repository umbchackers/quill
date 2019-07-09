require('dotenv').load();
var mongoose = require('mongoose');
// var database        = process.env.DATABASE || "mongodb://localhost:27017";
var database = "mongodb://reesdraminski:hackUMBC1!@ds261450.mlab.com:61450/heroku_t9msdkzp";
mongoose.connect(database);

var UserController = require('../app/server/controllers/UserController');

var adminUser = { email: process.env.ADMIN_EMAIL };
var fs = require('fs');
var Json2csvTransform = require('json2csv').Transform;

UserController
  .getAll(function(err, user) {
    if (err) console.err(err);

    // signUpCSV();
    // checkInCSV();
    // umbcCheckInCSV();
    // customSearch("I am allergic to cats");
    // admitUsers();
    // getUnverified();
    // getUnsubmitted();
    // getAcceptedAndNotConfirmed();
    // getNonConfirmed();
    // getConfirmed();
    updateUniversityEmailRecord();

    function updateUniversityEmailRecord() {
      var myData = {};

      for (var currentUser of user) {
        var email = currentUser.email;
        var extension = email.split("@")[1];
        var school = currentUser.profile.school;

        // If the school is a valid institution
        if (school != undefined && extension.includes(".edu") 
            && (school.includes("College") || school.includes("University")))
          myData[extension] = school;
      }

      console.log(myData);
    }

    function umbcCheckInCSV() {
      var myData = [];

      for (var i = 0; i < user.length; i++) {
        var item = {};
        var currentUser = user[i];

        if (currentUser.status.checkedIn && currentUser.email.includes("@umbc.edu")) {
          var name = currentUser.profile.name;

          item['first_name'] = name.split(" ")[0];
          
          if (name.split("").length > 1)
            item['last_name'] = name.split(" ")[1];
          else
            item['last_name'] = '';
  
          item['email'] = currentUser.email;
  
          myData.push(item);
        }
      }

      var Json2csvParser = require('json2csv').Parser;
      var fields = ['first_name', 'last_name', 'email'];

      var json2csvParser = new Json2csvParser({ 'fields': fields });
      var csv = json2csvParser.parse(myData);

      fs.writeFile('umbccheckins.csv', csv, function (err) {
        if (err) console.log(err);

        console.log('umbccheckins.csv written successfully.');
      });
    }

    function checkInCSV() {
      var myData = [];

      for (var i = 0; i < user.length; i++) {
        var item = {};
        var currentUser = user[i];

        if (currentUser.status.checkedIn) {
          var name = currentUser.profile.name;

          item['first_name'] = name.split(" ")[0];
          
          if (name.split("").length > 1)
            item['last_name'] = name.split(" ")[1];
          else
            item['last_name'] = '';
  
          item['email'] = currentUser.email;
          item['phone_number'] = currentUser.profile.phoneNumber + "";
          item['school'] = currentUser.profile.school;
  
          myData.push(item);
        }
      }

      var Json2csvParser = require('json2csv').Parser;
      var fields = ['first_name', 'last_name', 'email', 'phone_number', 'school'];

      var json2csvParser = new Json2csvParser({ 'fields': fields });
      var csv = json2csvParser.parse(myData);

      fs.writeFile('checkins.csv', csv, function (err) {
        if (err) console.log(err);

        console.log('checkins.csv written successfully.');
      });
    }

    function signUpCSV() {
      var myData = [];

      for (var i = 0; i < user.length; i++) {
        var item = {};
        var currentUser = user[i];

        if (currentUser.verified && currentUser.status.completedProfile) {
          var name = currentUser.profile.name;

          item['first_name'] = name.split(" ")[0];
          
          if (name.split("").length > 1)
            item['last_name'] = name.split(" ")[1];
          else
            item['last_name'] = '';
  
          item['email'] = currentUser.email;
          item['phone_number'] = currentUser.profile.phoneNumber;
          item['school'] = currentUser.profile.school;
  
          myData.push(item);
        }
      }

      var Json2csvParser = require('json2csv').Parser;
      var fields = ['first_name', 'last_name', 'email', 'phone_number', 'school'];

      var json2csvParser = new Json2csvParser({ 'fields': fields });
      var csv = json2csvParser.parse(myData);

      fs.writeFile('signups.csv', csv, function (err) {
        if (err) console.log(err);

        console.log('signups.csv written successfully.');
      });
    }

    function customSearch(query) {
      var users = [];
      for (var i = 0; i < user.length; i++) {
        var item = user[i];

        // If the user has submitted their profile and account was created before priority deadline
        if (item.confirmation.dietaryRestrictions.includes(query))
          console.log(item);
      }
    }

    function getConfirmed() {
      var users = [];
      for (var i = 0; i < user.length; i++) {
        var item = user[i];

        if (item.status.confirmed)
          users.push(item);
      }

      for (var i = 0; i < users.length; i++) {
        var item = users[i];
  
        // TODO Check if file exists beforehand and create it
        fs.appendFile('confirmed.txt', item.email + ", ", function (err) {
          if (err) throw err;
          console.log('Saved: ' + i);
        });
  
        console.log(item);
      }
    }

    function getNonConfirmed() {
      var users = [];
      for (var i = 0; i < user.length; i++) {
        var item = user[i];

        if (!item.status.confirmed)
          users.push(item);
      }

      for (var i = 0; i < users.length; i++) {
        var item = users[i];
  
        fs.appendFile('nonconfirmed.txt', item.email + ", ", function (err) {
          if (err) throw err;
          console.log('Saved: ' + i);
        });
  
        console.log(item);
      }
    }

    function admitUsers() {
      // Get time of priority deadline which will be compared lated
      var priorityDeadline = new Date(2018, 10, 16, 23, 59, 59, 99);
      priorityDeadline = priorityDeadline.getTime();

      // Go through all the users and filter and put in nice array
      var users = [];
      for (var i = 0; i < user.length; i++) {
        var item = user[i];

        // If the user has submitted their profile and account was created before priority deadline
        if (item.status.completedProfile && !item.status.admitted && item.timestamp < priorityDeadline)
          users.push(item);
      }

      // Say how many emails are going to be sent
      console.log("There are " + users.length + " users to send emails to.");

      // Send the emails five seconds apart
      (function delayedEmailSender(i) {          
        setTimeout(function () {
          // Get user from the array
          var item = users.pop();
          
          // Admit the user
          UserController.admitUser(item.id, adminUser, function() {});

          // Log the person the email was sent to
          console.log("Email sent to: " + item.email);
          console.log("Emails left to send: " + users.length);

          // decrement i and call delayedEmailSender again if i > 0
          if (--i) delayedEmailSender(i);      
        }, 5000);
      })(users.length);
    }

    function getUnverified() {
      var users = [];
      for (var i = 0; i < user.length; i++) {
        var item = user[i];

        if (!item.verified)
          users.push(item);
      }

      for (var i = 0; i < users.length; i++) {
        var item = users[i];
  
        fs.appendFile('unverified.txt', item.email + ", ", function (err) {
          if (err) throw err;
          console.log('Saved: ' + i);
        });
  
        console.log(item);
      }
    }

    function getUnsubmitted() {
      var users = [];
      for (var i = 0; i < user.length; i++) {
        var item = user[i];

        if (item.verified && !item.status.completedProfile)
          users.push(item);
      }

      for (var i = 0; i < users.length; i++) {
        var item = users[i];
  
        fs.appendFile('unsubmitted.txt', item.email + ", ", function (err) {
          if (err) throw err;
          console.log('Saved: ' + i);
        });
  
        console.log(item);
      }
    }

    function getAcceptedAndNotConfirmed() {
      var users = [];
      for (var i = 0; i < user.length; i++) {
        var item = user[i];

        if (item.status.admitted && !item.status.confirmed)
          users.push(item);
      }

      for (var i = 0; i < users.length; i++) {
        var item = users[i];
  
        fs.appendFile('unconfirmed.txt', item.email + ", ", function (err) {
          if (err) throw err;
          console.log('Saved: ' + i);
        });
  
        console.log(item);
      }
    }
  });

  