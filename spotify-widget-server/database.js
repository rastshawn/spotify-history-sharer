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

    let expDate = '';
    if (dbResults.SpotifyAuthExpiration) expDate = new Date(dbResults.SpotifyAuthExpiration.getTime());
    let spotifyAuth = {
        'accessToken' : dbResults.SpotifyAccessToken,
        'expiresAt' : expDate, // datetime
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
                            resolve(user.GoogleAccount.userID);
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

            

            pool.query(q, (error, results, fields) => {
                if (error) reject(error);
                else {
                    resolve(user.GoogleAccount.userID);
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
                    
                    resolve(ret);
                }
            });
        })  
    }

    getHistoryByGoogleID(googleID, start, end) {
        return new Promise((resolve, reject) => {
            let q = `SELECT SpotifyTrackID, PlayedAt FROM Listens WHERE GoogleUserID = '${googleID}'`;
            if (start && end) {
                q += `AND PlayedAt BETWEEN ${pool.escape(start)} AND ${pool.escape(end)}`;
            }
            q += ' ORDER BY PlayedAt DESC;';

            console.log(q);
            pool.query(q, (error, results, fields) => {
                if (error) reject(error);
                else {
                    resolve(results);
                }
            });
        })
    }

}