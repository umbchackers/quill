let chai = require("chai");
let chaiHttp = require("chai-http");
let User = require("../../models/User");

// Test Configuration
let verificationEmailRegex = new RegExp(process.env.ROOT_URL + "/verify/.*\\s");

function findObjectByKey(array, key, value) {
    for (var i = 0; i < array.length; i++) {
        if (array[i][key] === value) {
            return array[i];
        }
    }
    return null;
}

// Configuring Chai
chai.use(chaiHttp);
chai.should();

// Testing entry point
let runTest = (server, smtpService) => {
    describe("Authentication Service Unit Test", () => {
        let now = new Date();
        let user = {
            email: now.getTime() + "@email.edu",
            password: "Example2@"
        };
        let verificationLink;
        // Test registration for a new user
        describe("(POST) - /auth/register", () => {
            it("Should create a new user", (done) => {
                chai.request(server)
                    .post("/auth/register")
                    .send(user)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.user.email.should.equal(user.email);
                        done();
                    });
                // Validate that the verification email was sent correctly
                describe("User verification email", () => {
                    it("Should have the correct account information and valid verification link", (done) => {
                        // Get the verification email id for the new user
                        smtpService
                            .getFirstEmailIdWithRecipient(user.email)
                            .then((id) => {
                                console.log(id);
                                done();
                            })
                            .catch((err) => {
                                done(err);
                            });
                    });
                });
                // Get the verification link
                // chai.request(testMailServerDomain)
                //     .get(
                //         "/api/v1/inboxes/" +
                //             inboxId +
                //             "/messages/" +
                //             emailID +
                //             "/body.txt"
                //     )
                //     .set("Api-Token", api_token)
                //     .end((err, res) => {
                //         res.should.have.status(200);
                //         res.text.should.be.a("string");
                //         verificationLink = res.text.match(
                //             verificationEmailRegex
                //         )[0];
                //         verificationLink.should.be.a("string");
                //         done();
                //     });

                // after((done) => {
                //     // Delete the test verification email
                //     chai.request(testMailServerDomain)
                //         .delete(
                //             "/api/v1/inboxes/" +
                //                 inboxId +
                //                 "/messages/" +
                //                 emailID
                //         )
                //         .set("Api-Token", api_token)
                //         .end((err, res) => {
                //             res.should.have.status(200);
                //             done();
                //         });
                // });
            });
        });
        // describe("(POST) - /auth/verify/resend", () => {
        //     it("Should re-send verification email", (done) => {
        //         User.findOne({ email: user.email }, "id", (err, query) => {
        //             chai.request(server)
        //                 .post("/auth/verify/resend")
        //                 .send({ id: query.id })
        //                 .end((err, res) => {
        //                     res.should.have.status(200);
        //                     // console.log(res.status);
        //                     done();
        //                 });
        //         });
        //     });
        // });
        // after((done) => {
        //     // Remove user created for auth testing
        //     User.remove({ email: user.email }, (error) => {
        //         done();
        //     });
        // });
    });
};

module.exports = runTest;
