import { Injectable } from '@nestjs/common';
import { User } from './users.service';
import * as mysql from 'mysql';
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
  private pool = databaseConnection;

    addUser(user: User): Promise<User>{
        return new Promise((resolve, reject) => {
            this.pool.query(
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
                SpotifyAuthExpiration = ${this.pool.escape(user.SpotifyAuth.expiresAt)},
                SpotifyRefreshToken = '${user.SpotifyAuth.refreshToken}'
                WHERE GoogleUserID = '${user.GoogleAccount.userID}';`;

            

                this.pool.query(q, (error, results, fields) => {
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

            this.pool.query(q, (error, results, fields) => {
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
                q += `AND PlayedAt BETWEEN ${this.pool.escape(start)} AND ${this.pool.escape(end)}`;
            }
            q += ' ORDER BY PlayedAt DESC;';

            console.log(q);
            this.pool.query(q, (error, results, fields) => {
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

            this.pool.query(q, (error, results, fields) => {
                if (error) reject(error);
                else {
                    
                    let ret = buildUserObj(results[0]);
                    
                    resolve(ret);
                }
            });
        }) 
    } 
}


