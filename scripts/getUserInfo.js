require('dotenv').load();
var mongoose = require('mongoose');
var database = process.env.DATABASE;
mongoose.connect(database);
let User = require('../app/server/models/User');
const { Parser } = require('json2csv');

// This is an index value
const filterChoice = 2;
let filterList = [
    { verified: true },
    { verified: true, 'status.completedProfile': true },
    {
        'status.checkedIn': true,
        verified: true,
        'status.completedProfile': true,
        'status.confirmed': true
    }
];
let projection = {
    _id: false,
    email: true,
    'profile.name': true,
    'profile.school': true,
    'profile.phoneNumber': true
};

User.find(filterList[filterChoice], projection, (err, userQuery) => {
    if (err) {
        return Promise.reject(new Error('Error finding users!'));
    } else {
        return Promise.resolve(userQuery);
    }
})
    .then((query) => {
        let csvFormat = [
            'name',
            // 'last name',
            // 'email',
            // 'University',
            // 'phone'
        ];
        let users = [];
        // console.log(query);
        query.forEach((user) => {
            // console.log(user);
            // let fullName = user.profile.name.split(' ');
            // let firstName = fullName[0];
            // let lastName = '';
            // if (fullName.length - 1 > 0)
            //     lastName = fullName[fullName.length - 1];
            // else console.log(fullName);
            let parsedUser = {
                name: user.profile.name
                // 'last name': lastName,
                // email: user.email,
                // University: user.profile.school,
                // phone: user.profile.phoneNumber
            };
            // console.log(parsedUser);
            users.push(parsedUser);
        });
        const json2csvParser = new Parser({ csvFormat });
        const csv = json2csvParser.parse(users);
        console.log(csv);
        process.exit(0);
    })
    .catch((err) => {
        console.log(err);
        process.exit(1);
    });
