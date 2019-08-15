let chai = require("chai");
let chaiHttp = require("chai-http");

let User = require("../../models/User");

// Test Configuration
const testMailServerDomain = "http://mailtrap.io";

const api_token = process.env.TEST_EMAIL_API_TOKEN;

// Configuring Chai
chai.use(chaiHttp);
chai.should();
let runTest = (server) => {
    describe("Authentication Service Unit Test", () => {
        // Test adding a user
        let now = new Date();
        let user = {
            email: now.getTime() + "@email.edu",
            password: "Example2@"
        };
        console.log(user.email);
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
            });
            // Validate that the verification email was sent
            describe("Verification Email", () => {
                it("Should have expected validation link and user information", (done) => {
                    let inboxId;
                    // Get the Quill test inbox
                    chai.request(testMailServerDomain)
                        .get("/api/v1/inboxes/")
                        .set("Api-Token", api_token)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a("array");
                            inboxId = res.body[0].id;
                            // Get the verification email for the new user
                            chai.request(testMailServerDomain)
                                .get("/api/v1/inboxes/" + inboxId + "/messages")
                                .set("Api-Token", api_token)
                                .end((err, res) => {
                                    res.should.have.status(200);
                                    var obj = findObjectByKey(
                                        res.body,
                                        "to_email",
                                        user.email
                                    );

                                    console.log(obj);
                                    done();
                                });
                        });
                });
            });
        });
    });
    after((done) => {
        // Remove all users other than admin after testing is complete
        User.remove({ admin: { $nin: ["true"] } }, (error) => {
            done();
        });
    });
};

module.exports = runTest;
