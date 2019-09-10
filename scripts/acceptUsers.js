require("dotenv").load();
var mongoose = require("mongoose");
var database = process.env.DATABASE || "mongodb://localhost:27017";
var jwt = require("jsonwebtoken");
mongoose.connect(database);

var UserController = require("../app/server/controllers/UserController");
let User = require("../app/server/models/User");
let interval = 60000; // how much time should the delay between two iterations be (in milliseconds)?

var editingUser = { email: process.env.ADMIN_EMAIL };

// var userArray = require('fs').readFileSync('accepted.txt').toString().split('\n');

User.find(
    { admin: false, verified: true, "status.admitted": false },
    (err, users) => {
        if (err) return;
        users.forEach((user, index) => {
            setTimeout(() => {
                UserController.admitUser(user.id, editingUser, (err) => {
                    if (err) {
                        User.findOneAndUpdate(
                            { _id: user._id },
                            { $set: { "status.admitted": false } },
                            () => {
                                console.log(
                                    "Encountered an error while accepting user: " +
                                        err
                                );
                                console.log(
                                    user.email +
                                        " acceptance status was revoked"
                                );
                                if (index >= users.length - 1) process.exit(0);
                            }
                        );
                    } else {
                        console.log("accepted user: " + user.email);
                        if (index >= users.length - 1) process.exit(0);
                    }
                });
            }, index * interval);
        });
    }
);
