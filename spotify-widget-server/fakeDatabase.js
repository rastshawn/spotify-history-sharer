let users = [];

module.exports = class FakeDatabase {
    constructor() {};

    addUser(user){
        return new Promise((resolve, reject) => {
            console.log("user added within db")
            users[user.GoogleAccount.userID] = user;
            //console.log(users);
            resolve(user);
            // TODO check if user already exists
        })  
    }

    updateUser(user) {
        return new Promise((resolve, reject) => {
            users[user.GoogleAccount.userID] = user;
            resolve(user);
            // TODO check if user does not exist
        })  
    }

    getUserByGoogleID(googleID) {
        console.log("getUserByGoogleID");
        console.log(users);
        return new Promise((resolve, reject) => {
            resolve(users[googleID]);
            // TODO check to see if user exists
        });
    }

}