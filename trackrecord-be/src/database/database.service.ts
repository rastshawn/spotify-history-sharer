import { Injectable } from '@nestjs/common';
import * as mysql from 'mysql';
import { User } from 'src/types/user.dto';
require('dotenv').config() // TODO needs to be in this file because of bug? 

let buildUserObj = function(dbResults): User {
    // if passed null, return null
    if (!dbResults){
        return dbResults;
    }

    let googleAccount = {
        userID : dbResults.GoogleUserID,
    }

    let expDate = {};
    if (dbResults.SpotifyAuthExpiration) expDate = new Date(dbResults.SpotifyAuthExpiration.getTime());
    let spotifyAuth = {
        'accessToken' : dbResults.SpotifyAccessToken,
        'expiresAt' : expDate, // datetime
        'refreshToken' : dbResults.SpotifyRefreshToken // for getting new tokens
    };

    return new User(googleAccount, spotifyAuth);
}

console.log(process.env);
const mysqlOptions = {
    connectionLimit: 5,
    host: 'localhost',
    port: 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME, 
   // dateStrings: true
};
const databaseConnection = mysql.createPool(mysqlOptions);

@Injectable()
export class DatabaseService {
  //private pool = databaseConnection;

    addUser(user: User): Promise<User>{
        return new Promise((resolve, reject) => {
            databaseConnection.query(
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

    updateUser(user: User): Promise<User>{
        return new Promise((resolve, reject) => {
            // TODO check if user does not exist

            let q = `UPDATE Users SET
                SpotifyAccessToken = '${user.SpotifyAuth.accessToken}',
                SpotifyAuthExpiration = ${databaseConnection.escape(user.SpotifyAuth.expiresAt)},
                SpotifyRefreshToken = '${user.SpotifyAuth.refreshToken}'
                WHERE GoogleUserID = '${user.GoogleAccount.userID}';`;

            

                databaseConnection.query(q, (error, results, fields) => {
                if (error) reject(error);
                else {
                    resolve(user.GoogleAccount.userID);
                }
            });
        }).then(this.getUserByGoogleID);
    }

    getUserByGoogleID(googleID): Promise<User> {
        return new Promise((resolve, reject) => {
            // TODO check if user does not exist
            let q = `SELECT * FROM Users WHERE GoogleUserID = '${googleID}';`;

            databaseConnection.query(q, (error, results, fields) => {
                if (error) reject(error);
                else {
                    
                    let ret = buildUserObj(results[0]);
                    
                    resolve(ret);
                }
            });
        })  
    }

    getHistoryByGoogleID(googleID, start=null, end=null) {
        return new Promise((resolve, reject) => {
            let q = `SELECT SpotifyTrackID, PlayedAt FROM Listens WHERE GoogleUserID = '${googleID}'`;
            if (start && end) {
                const startDate = new Date(parseInt(start));
                const endDate = new Date(parseInt(end));
                q += `AND PlayedAt BETWEEN ${databaseConnection.escape(startDate)} AND ${databaseConnection.escape(endDate)}`;
            }
            q += ' ORDER BY PlayedAt DESC LIMIT 1500;';

            console.log(q);
            databaseConnection.query(q, (error, results, fields) => {
                if (error) reject(error);
                else {
                    resolve(results);
                }
            });
        })
    }

    getAll() {
        return new Promise((resolve, reject) => {
            // TODO check if user does not exist
            let q = `SELECT * FROM Users;`;

            databaseConnection.query(q, (error, results, fields) => {
                if (error) reject(error);
                else {
                    
                    let ret = buildUserObj(results[0]);
                    
                    resolve(ret);
                }
            });
        }) 
    } 
}


