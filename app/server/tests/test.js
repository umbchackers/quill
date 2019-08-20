require("dotenv").load({ silent: true });

// Inject testing env
process.env.NODE_ENV = "test";
process.env.EMAIL_HOST = process.env.TEST_EMAIL_HOST;
process.env.EMAIL_USER = process.env.TEST_EMAIL_USER;
process.env.EMAIL_PASS = process.env.TEST_EMAIL_PASS;
process.env.EMAIL_PORT = process.env.TEST_EMAIL_PORT;
process.env.EMAIL_SECURE = process.env.TEST_EMAIL_SECURE;
process.env.EMAIL_IGNORE_TLS = process.env.TEST_EMAIL_IGNORE_TLS;
// Initalize app server and smtp testing service instance for testing
var server = require("../../../app");
var smtpService = require("./utils/smtp");

let runAuthUnitTest = require("./units/auth-test");

//------------//
// Unit Tests //
//------------//

// smtpService.getEmailIdWithRecipient("test@email.com");

runAuthUnitTest(server, smtpService);

// Close app and smtp server
smtpService.closeServer();
server.close();
