require("dotenv").load();
var mongoose = require("mongoose");
var database = process.env.DATABASE || "mongodb://localhost:27017";
var jwt = require("jsonwebtoken");
mongoose.connect(database);

var UserController = require("../app/server/controllers/UserController");
let User = require("../app/server/models/User");
let interval = 600; // how much time should the delay between two iterations be (in milliseconds)?

var userArray = require("fs")
    .readFileSync("reset.txt")
    .toString()
    .split(",");

userArray.forEach((email) => {
    User.findOne({ email: email }, (err, user) => {
        if (err) return;
        console.log("Found user: " + user.email);
        let password = email.substr(0, email.indexOf("@")) + "hackUMBC@";
        UserController.newPassword(user._id, password, (err, message) => {
            if (!err)
                console.log(
                    "Reset password for user with email: " +
                        user.email +
                        " to: " +
                        password
                );
            else {
                console.log(err);
                console.log(
                    "Unable to reset password for user with email: " +
                        user.email
                );
                return;
            }
        });
    });
});
