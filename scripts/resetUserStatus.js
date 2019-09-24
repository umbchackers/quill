require("dotenv").load();
var mongoose = require("mongoose");
var database = process.env.DATABASE || "mongodb://localhost:27017";
var jwt = require("jsonwebtoken");
mongoose.connect(database);

var UserController = require("../app/server/controllers/UserController");
let User = require("../app/server/models/User");

User.updateMany(
    { email: "hacker6@school.edu" },
    {
        "status.completedProfile": false,
        "status.admitted": false,
        "status.confirmed": false
    },
    (err, res) => {
        console.log(res.n);
    }
);
