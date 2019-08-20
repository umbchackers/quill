// Configuration
const NUM_RETRIES = 6;
const TEST_TIMEOUT = 5000;
const RETRY_OFFSET = (TEST_TIMEOUT - 500) / NUM_RETRIES;

// SMTP Server setup for testing
var MailDev = require("maildev");

var smtpServer = new MailDev({
    // 1025 is the default port for maildev smtp; 1080 for the web interface
    smtp: 1025
});

smtpServer.listen((err) => {
    if (err)
        console.log(
            "Encountered Error while starting smtp Server: " + err.message
        );
});

// Service abstraction for SMTP Server
// Abstracts the maildev calls into buisness logic as well as adds promise wrappers

// Service Functions

/**
 * Get a list of email IDs that were sent to a given recipient email address.
 * @param {string} recipient - The recipients email address to search for.
 */
const getAllEmailIdWithRecipient = (recipient) => {
    return new Promise((resolve, reject) => {
        let count = 0,
            ids = [];
        let intervalId = setInterval(() => {
            // console.log("Interval");
            smtpServer.getAllEmail((err, emails) => {
                if (emails)
                    emails.forEach((email) => {
                        let recipients = email.to;
                        if (recipients.some((to) => to.address === recipient))
                            ids.push(email.id);
                    });
                // else console.log("SMTP Server returned 0 emails");
            });
            if (ids.length > 0) {
                clearInterval(intervalId);
                resolve(ids);
            }
            count++;
            if (count >= NUM_RETRIES) {
                clearInterval(intervalId);
                reject(new Error("Exceeded retry count"));
            }
        }, RETRY_OFFSET);
    });
};
/**
 * Get the first email id found that was sent to a given recipient email address.
 * @param {string} recipient - The recipients email address to search for.
 */
const getFirstEmailIdWithRecipient = (recipient) => {
    return getAllEmailIdWithRecipient(recipient)
        .then((ids) => {
            return ids[0];
        })
        .catch((err) => {
            throw new Error("Unable to find email id: " + err.message);
        });
};
/**
 * Get the email object with a given id.
 * @param {int} id - The id of the email to return.
 */
const getEmailWithId = (id) => {
    return new Promise((resolve, reject) =>
        smtpServer.getEmail(id, (err, email) => {
            if (err) return reject(err);
            if (!email)
                return reject(new Error("Unable to find email with id " + id));
            resolve(email);
        })
    );
};
/**
 * Provides external access to close the server.
 */
const closeServer = () => {
    smtpServer.close();
};

const smtpService = {
    getAllEmailIdWithRecipient,
    getFirstEmailIdWithRecipient,
    getEmailWithId,
    closeServer
};

module.exports = smtpService;
