//let users = [];
const User = require('./user');
let pool = {};
let buildUserObj = function(dbResults) {

    // if passed null, return null
    if (!dbResults){
        return dbResults;
    }

    let googleAccount = {
        userID : dbResults.GoogleUserID,
    }

    let spotifyAuth = {
        'accessToken' : dbResults.SpotifyAccessToken,
        'expiresAt' : dbResults.SpotityAuthExpiration, // datetime
        'refreshToken' : dbResults.SpotifyRefreshToken // for getting new tokens
    };

    return new User(googleAccount, spotifyAuth);
}
module.exports = class Database {
    constructor(dbPool){
        Database.Pool = dbPool;
    }

    static get Pool() {
        return pool;
    }

    static set Pool(dbPool) {
        pool = dbPool;
    }



    addUser(user){
        return new Promise((resolve, reject) => {
            pool.query(
                `INSERT INTO Users(GoogleUserID) VALUES ('${user.googleAccount.userID}');`,
                    (error, results, fields) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(user);
                        }
                    }
            );
        }).then(this.getUserByGoogleID);  
    }

    updateUser(user) {
        return new Promise((resolve, reject) => {
            // TODO check if user does not exist
            let q = `UPDATE Users SET
                SpotifyAccessToken = '${user.SpotifyAuth.accessToken}',
                SpotifyAuthExpiration = ${pool.escape(user.SpotifyAuth.expiresAt)},
                SpotifyRefreshToken = '${user.SpotifyAuth.refreshToken}'
                WHERE GoogleUserID = '${user.GoogleAccount.userID}';`;

            console.log(q);

            pool.query(q, (error, results, fields) => {
                if (error) reject(error);
                else {
                    resolve(user);
                }
            });
        }).then(this.getUserByGoogleID);
    }

    getUserByGoogleID(googleID) {
        return new Promise((resolve, reject) => {
            // TODO check if user does not exist
            let q = `SELECT * FROM Users WHERE GoogleUserID = '${googleID}';`;

            pool.query(q, (error, results, fields) => {
                if (error) reject(error);
                else {
                    let ret = buildUserObj(results[0]);
                    console.log("result from DB: ");
                    console.log(ret);
                    resolve(ret);
                }
            });
        })  
    }

}