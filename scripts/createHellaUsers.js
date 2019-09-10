require("dotenv").load();
// Connect to mongodb
var mongoose = require("mongoose");
var database = process.env.DATABASE || { url: "mongodb://localhost:27017" };
mongoose.connect(database);
var UserController = require("../app/server/controllers/UserController");
let User = require("../app/server/models/User");

let users = 10;
let username = "hacker";
let i = 0;
let interval = 60000;
User.remove({ admin: false }, (err) => {
    err && console.log(err);
    // process.exit(0);
});
let id = setInterval(() => {
    email = username + i + "@school.edu";
    UserController.createUser(email, "foobar", function(err, token) {
        if (err) {
            console.log("Error while creating user: " + err.message);
            process.exit(1);
        }
        // console.log(token.user.email);
        // Uncomment this to verify each of the new users as they are created
        verifyNewUser(token.user.email);
    });
    i++;
    if (i >= users) clearInterval(id);
}, interval);

const verifyNewUser = (email) => {
    User.findOneAndUpdate(
        { email: email },
        { $set: { verified: true } },
        (err, user) => {
            if (err || !user) {
                console.log("Error verifying user: " + email);
                process.exit(1);
            }
            console.log(email + " created and verified.");
            if (email.includes(users - 1)) process.exit(0);
        }
    );
};
