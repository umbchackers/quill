// Initalize server instance for testing
var server = require("../../../app");

// Populate env with values for testing
// process.env.NODE_ENV = "test";

process.env.EMAIL_HOST = process.env.TEST_EMAIL_HOST;
process.env.EMAIL_USER = process.env.TEST_EMAIL_USER;
process.env.EMAIL_PASS = process.env.TEST_EMAIL_PASS;
process.env.EMAIL_PORT = process.env.TEST_EMAIL_PORT;
process.env.EMAIL_SECURE = process.env.TEST_EMAIL_SECURE;

//------------//
// Unit Tests //
//------------//
let runUserUnitTest = require("./unit-tests/auth-test");

runUserUnitTest(server);
