// from NestJS Auth demo
import { Injectable } from '@nestjs/common';
import { DatabaseService } from './database.service';
@Injectable()
export class UsersService {
  private readonly users: User[];

  constructor(private databaseService: DatabaseService) {
    this.users = [];
  }

  async getUserByGoogleID(googleUserID) {
    return this.databaseService.getUserByGoogleID(googleUserID);
  }
}

export class User {
  googleAccount: any;
  spotifyAuthInfo: any;
  

  constructor(googleAccount, spotifyAuthInfo) {
    this.googleAccount = googleAccount;
    this.spotifyAuthInfo = spotifyAuthInfo;
}

  get GoogleAccount() {
      if (this.googleAccount && !this.googleAccount.userID){
          // return false - while the object may only contain null values, 
          // it doesn't evaulate to falsy

          // if this has ever been set, userID will have a value
          return false;
      }
      return this.googleAccount;
  }

  set GoogleAccount(googleAccount) {
      this.googleAccount = googleAccount;
  }

  get SpotifyAuth() {
      if (this.spotifyAuthInfo && !this.spotifyAuthInfo.refreshToken){
          // return false - while the object may only contain null values, 
          // it doesn't evaulate to falsy

          // if this has ever been set, refreshToken will have a value
          return false;
      }

      return this.spotifyAuthInfo;
  }

  set SpotifyAuth(spotifyAuth) {
      this.spotifyAuthInfo = spotifyAuth;
  }
};

