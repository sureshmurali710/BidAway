const dbConnection = require("../database/mongoConnection");
const bidsDataApi = require("../data/bids");
const userDataApi = require("../data/user");

const addUsers = async function addUsers() {
    const addedUsers = [];
    const users = [{
        "username":"Daniel James",
        "emailid":"dj@mu.com",
        "password":"12345678",
        "phone_num":"1212121212",
        "DOB":"1996-01-01",
        "category":"Electronics"
    },{
        "username":"Harry Kane",
        "emailid":"HK@spurs.com",
        "password":"harrykane",
        "phone_num":"1313131313",
        "DOB":"1996-01-01",
        "category":"Furniture"
    },{
        "username":"Harry Maguire",
        "emailid":"HM@mu.com",
        "password":"1111111111",
        "phone_num":"1212321212",
        "DOB":"1996-01-01",
        "category":"Electronics",
        "isUserAdmin":true
    }];

    for (let i = 0; i < users.length; ++i) {
        const user = users[i];
        const addedUser = await userDataApi.createuser(user.username,user.emailid,user.password,
            user.phone_num,user.DOB,user.category,user.isUserAdmin);

        addedUsers.push(addedUser);

        console.log('User ' + addedUser.username + ' added');
    }

    return addedUsers;
}

const addItems = async (addedUsers) => {

    const seedItems = [{
        user_id :addedUsers[0]._id.toString(),
        item_title: 'iPhone XV',
        description: 'You can run, You can hide, but can\'t escape our ecosystem',
        category: ['Electronics'],
        image: 'public/images/iphone_XV.jpg',
        time_period: "200",
        starting_price: "100.67"
    },{
        user_id : addedUsers[1]._id.toString(),
        item_title: 'Google Home',
        description: 'I know what you did last summer',
        category: ['Electronics'],
        image: 'public/images/google_home.jpg',
        time_period: "200",
        time_period: "100",
        starting_price: "69.69"
    },{
        user_id : addedUsers[2]._id.toString(),
        item_title: 'Galaxy Nexus',
        description: 'Back when Android was cool',
        category: ['Electronics'],
        image: 'public/images/nexus.jpg',
        time_period: "100",
        starting_price: "330.37"
    },{
        user_id : addedUsers[0]._id.toString(),
        item_title: 'Table',
        description: 'Wobbly',
        category: ['Furniture'],
        image: 'public/images/table.jpg',
        time_period: "11",
        starting_price: "10.67"
    },{
        user_id : addedUsers[1]._id.toString(),
        item_title: 'Chair',
        description: 'Two Legs',
        category: ['Furniture'],
        image: 'public/images/chair.jpg',
        time_period: "167",
        starting_price: "2000.18"
    },{
        user_id : addedUsers[2]._id.toString(),
        item_title: 'Couch',
        description: 'Ouch!',
        category: ['Furniture'],
        image: 'public/images/couch.jpg',
        starting_price: "5.22",
        time_period: "145"
    }];

    for (let i = 0; i < seedItems.length; ++i) {
        const item = seedItems[i];
        await bidsDataApi.addItemForBid(item);
        console.log('Item added ' + item.item_title + ' added');
    }
}



const main = async () => {
    console.log('Droping existing DB');
    const db = await dbConnection();
    await db.dropDatabase();

    console.log('Addding User...');
    const addedUsers = await addUsers();

    console.log('Addding Item...');
    await addItems(addedUsers);

    process.exit();
}

(async () => await main())()
