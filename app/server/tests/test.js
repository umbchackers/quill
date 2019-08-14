process.env.NODE_ENV = "test";
// Get server instance for testing
var server = require("../../../app");

//------------//
// Unit Tests //
//------------//
let runUserUnitTest = require("./unit-tests/user-test");

runUserUnitTest(server);

after((done) => {
    server.close();
    done();
});
