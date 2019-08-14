let chai = require("chai");
let chaiHttp = require("chai-http");

let User = require("../../models/User");

// Configuring Chai
chai.use(chaiHttp);
chai.should();
let runTest = (server) => {
    describe("Authentication Service Unit Test", () => {
        // Test adding a user
        describe("(POST) - /auth/register", () => {
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
        // Test getting the unverified user
        //     describe("(POST) - /auth/register", () => {
        //         it("Should create a new user", (done) => {
        //             let user = {
        //                 email: "jao2@umbc.edu",
        //                 password: "Example2@"
        //             };
        //             chai.request(server)
        //                 .post("/auth/register")
        //                 .send(user)
        //                 .end((err, res) => {
        //                     res.should.have.status(200);
        //                     res.body.user.email.should.equal(user.email);
        //                     done();
        //                 });
        //         });
        //     });
    });
    after((done) => {
        // Remove all users other than admin after testing is complete
        User.remove({ admin: { $nin: ["true"] } }, (error) => {
            done();
        });
    });
};

module.exports = runTest;
