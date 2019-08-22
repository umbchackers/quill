let chai = require("chai");
let chaiHttp = require("chai-http");
let User = require("../../models/User");

// Test Configuration
let verificationEmailRegex = new RegExp(process.env.ROOT_URL + "/verify/.*\\s");
let passwordResetEmailRegex = new RegExp(process.env.ROOT_URL + "/verify/.*\\s");

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
                        if (err) return done(err);
                        res.should.have.status(200);
                        // Check the return value of the call
                        res.body.user.email.should.equal(user.email);
                        // Validate that the verification email was sent correctly
                        smtpService
                            .getAndDeleteFirstEmailWithRecipient(user.email)
                            .then((email) => {
                                verificationLink = email.text.match(
                                    verificationEmailRegex
                                );
                                console.log(JSON.stringify(verificationLink));
                                verificationLink.should.be.a("string");
                                done();
                            })
                            .catch((err) => {
                                done(err);
                            });
                    });
            });
        });
        describe("(POST) - /auth/verify/resend", () => {
            it("Should re-send verification email", (done) => {
                User.findOne({ email: user.email }, "id", (err, query) => {
                    if (err) return done(err);
                    chai.request(server)
                        .post("/auth/verify/resend")
                        .send({ id: query.id })
                        .end((err, res) => {
                            if (err) return done(err);
                            res.should.have.status(200);
                            // Validate that the verification email was sent correctly
                            smtpService
                                .getAndDeleteFirstEmailWithRecipient(user.email)
                                .then((email) => {
                                    verificationLink = email.text.match(
                                        verificationEmailRegex
                                    );
                                    console.log(
                                        JSON.stringify(verificationLink)
                                    );
                                    verificationLink.should.be.a("string");
                                    done();
                                })
                                .catch((err) => {
                                    done(err);
                                });
                        });
                });
            });
        });
        describe("(GET) - /auth/verify/:token", () => {
            it("Should verify the user", (done) => {
                User.findOne({ email: user.email }, (err, query) => {
                    if (err) return done(err);
                    let token = query.generateEmailVerificationToken();
                    chai.request(server)
                        .get("/auth/verify/" + token)
                        .end((err, res) => {
                            if (err) return done(err);
                            res.should.have.status(200);
                            res.body.verified.should.be.true;
                            done();
                        });
                });
            });
        });
        describe("(POST) - /auth/login [With email and password]", () => {
            it("Should login the user", (done) => {
                User.findOne({ email: user.email }, (err, query) => {
                    let token;
                    if (err) return done(err);
                    chai.request(server)
                        .post("/auth/login/")
                        .send({ email: user.email, password: user.password })
                        .end((err, res) => {
                            if (err) return done(err);
                            res.should.have.status(200);
                            res.body.token.should.be.a("string");
                            token = res.body.token;
                        });
                    // login with invalid token (expected to fail)
                    chai.request(server)
                        .post("/auth/login/")
                        .send({
                            email: user.email,
                            password: user.password,
                            token: "Invalid_Token_Value"
                        })
                        .end((err, res) => {
                            if (err) return done(err);
                            res.should.have.status(400);
                        });
                    // login with valid token
                    chai.request(server)
                        .post("/auth/login/")
                        .send({
                            email: user.email,
                            password: user.password,
                            token: token
                        })
                        .end((err, res) => {
                            if (err) return done(err);
                            res.should.have.status(200);
                            done();
                        });
                });
            });
        });
        describe("(POST) - /reset", () => {
            it("Should send a password reset email to the users email", (done) => {
                chai.request(server)
                    .get("/reset")
                    .send({ email: user.email })
                    .end((err, res) => {
                        if (err) return done(err);
                        res.should.have.status(200);
                        // Validate that the verification email was sent correctly
                        smtpService
                            .getAndDeleteFirstEmailWithRecipient(user.email)
                            .then((email) => {
                                verificationLink = email.text.match(
                                    verificationEmailRegex
                                );
                                console.log(JSON.stringify(verificationLink));
                                verificationLink.should.be.a("string");
                                done();
                            })
                            .catch((err) => {
                                done(err);
                            });
                    });
            });
        });
        after((done) => {
            // Remove user created for auth testing
            User.remove({ email: user.email }, (error) => {
                done();
            });
        });
    });
};

module.exports = runTest;
