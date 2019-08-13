process.env.NODE_ENV = "test";

let chai = require("chai");
let chaiHttp = require("chai-http");

let app = require("../../../app").app;
let startup = require("../../../app").startup;
let User = require("../models/User");

// Configuring Chai
chai.use(chaiHttp);
chai.should();
before((done) => {
    startup.on("complete", function() {
        done();
    });
});

describe("Users", () => {
    beforeEach((done) => {
        // Remove all users before each test
        User.remove({}, (error) => {
            done();
        });
    });
    // Test adding a user
    describe("/POST user", () => {
        it("Should POST a new user to be created", (done) => {
            let user = {
                email: "user@email.edu",
                password: "Example2@"
            };
            chai.request(app)
                .post("/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    done();
                });
        });
    });
});
