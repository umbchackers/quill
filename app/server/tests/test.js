process.env.NODE_ENV = "test";

let chai = require("chai");
let chaiHttp = require("chai-http");

var server = require("../../../app.js");
let User = require("../models/User");

// Configuring Chai
chai.use(chaiHttp);
chai.should();

describe("Users", () => {
    beforeEach((done) => {
        // Remove all users before each test
        User.remove({}, (error) => {
            done();
        });
    });
    // Test adding a user
    describe("/POST user", () => {
        it("Should create a new user", (done) => {
            let user = {
                email: "user@email.edu",
                password: "Example2@"
            };
            chai.request(server)
                .post("/auth/register")
                .send(user)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.user.email.should.equal(user.email);
                    done();
                });
        });
    });
});

// after(() => {
//     server.close();
// });
