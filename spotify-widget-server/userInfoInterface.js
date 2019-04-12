let account = '';
let database = {};

class UserInfoInterface {

    constructor(db) {
        database = db;
        account = new (require('./account'))();
    }

    static addUser(user){
        return database.addUser(user);  
    }

    static updateUser(user) {
        return database.updateUser(user);
    }

    static getUserByGoogleID(googleID) {
        return database.getUserByGoogleID(googleID);
    }

    static getUserByGoogleAuthToken(googleAuthToken) {
        return account.getIDFromAuthToken(googleAuthToken)
            .then(this.getUserByGoogleID);
    }

    static getHistoryByGoogleID(googleID) {
        return database.getHistoryByGoogleID(googleID);
    }

}

//UserInfoInterface.database = {};

module.exports = UserInfoInterface;
