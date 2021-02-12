// modified from NestJS Auth demo
import { Injectable, HttpService } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { DatabaseService } from 'src/database/database.service';
import { User } from 'src/types/user.dto';



@Injectable()
export class AuthService {
  private currentCode;
  constructor(private httpService: HttpService, private databaseService: DatabaseService, private jwtService: JwtService) {}

  // // called by local strategy
  // async validateUser(username: string, pass: string): Promise<any> {
  //   const user = await this.usersService.findOne(username);
  //   if (user && user.password === pass) {
  //     const { password, ...result } = user;
  //     return result;
  //   }
  //   return null;
  // }

  // Old, for local strategy
  // async login(user: any) {
  //   // Payload should consist of the spotify and google IDs if available
  //   const payload = { username: user.username, sub: user.userId };
  //   return {
  //     access_token: this.jwtService.sign(payload),
  //   };
  // }

  async googleLogin(idToken) {
    // TODO try/catch
    const googleUserID = await this.getGoogleUserIDFromAuthToken(idToken);
    const user = await this.databaseService.getUserByGoogleID(googleUserID);
    


    if (user) {
      return {
        access_token: this.jwtService.sign({user: user}),
      }
    } else {
      // user does not exist in database
      // make new user
      const newUser = new User({
        userID : googleUserID,
      }, null); // spotify info is null 

      // add user to database
      await this.databaseService.addUser(newUser);

      // retry login
      return this.googleLogin(idToken);
    }
  }



  // TODO POSSIBLY THE SAME AS getGoogleAuthToken 
  async getGoogleUserIDFromAuthToken(authToken) {
    try {
      const response = await this.httpService.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${authToken}`
      ).toPromise();
      return response.data.sub;
    } catch(e) {
      // TODO
    }
  }

  async fetchSpotifyAccessCode(userID) {
    const user = await this.databaseService.getUserByGoogleID(userID);
    const now = new Date();
    if (user.SpotifyAuth.expiresAt > now){
      return user.SpotifyAuth.accessToken;
    } else {
      const refreshResponse = await this.refreshSpotifyAccessCode(userID);
      return refreshResponse.SpotifyAuth.accessToken;
    }
  }

  async fetchSpotifyAccountData(userID: string) {
    const authCode = await this.fetchSpotifyAccessCode(userID);
    let call = {
      method: 'get' as any,
      url: 'https://api.spotify.com/v1/me',
      headers: {
        'Authorization': 'Bearer ' + authCode
      }	
    };

    const response = await this.httpService.request(call).toPromise(); 
    return {
      authCode, 
      spotifyUserID: response.data.id
    }
  }

  async refreshSpotifyAccessCode(userID: string) {
    const user = await this.databaseService.getUserByGoogleID(userID);
    let call = {
      method: 'post' as any,
      url : 'https://accounts.spotify.com/api/token',
      headers: {
          'Authorization' : 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
          'Content-Type' : 'application/x-www-form-urlencoded'
      },
      params: {
          'grant_type': 'refresh_token',
          'refresh_token' : user.SpotifyAuth.refreshToken
      },
    };

    // sample response
    /*
      data: {
        access_token: '*****',
        token_type: 'Bearer',
        expires_in: 3600,
        scope: 'user-read-recently-played'
      }
    */
    let result = await this.httpService.request(call).toPromise();
    const accessCodeResponse = result.data;

    let spotifyAuth = {
      'accessToken' : accessCodeResponse.access_token,
      'expiresAt' : this.getExpiryDate(accessCodeResponse.expires_in), // num seconds 
      'refreshToken' : user.SpotifyAuth.refreshToken
    };

    const currentUser = await this.databaseService.getUserByGoogleID(userID)
    currentUser.SpotifyAuth = spotifyAuth;

    return this.databaseService.updateUser(currentUser);
  }

  async saveNewSpotifyAccessCode(loginAuthCode: string, userID: string){
    // get token
    let call = {
      method: 'post' as any,
      url : 'https://accounts.spotify.com/api/token',
      headers: {
          'Authorization' : 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
          'Content-Type' : 'application/x-www-form-urlencoded'
      },
      params: {
          'grant_type': 'authorization_code',
          'code' : loginAuthCode,
          'redirect_uri' : process.env.APP_HOST + '/SpotifyConnect',
      },
    };

    // sample response
    /*
      data: {
        access_token: '*****',
        token_type: 'Bearer',
        expires_in: 3600,
        refresh_token: '*****',
        scope: 'user-read-recently-played'
      }
    */
    let result = await this.httpService.request(call).toPromise();
    const accessCodeResponse = result.data;

    let spotifyAuth = {
      'accessToken' : accessCodeResponse.access_token,
      'expiresAt' : this.getExpiryDate(accessCodeResponse.expires_in), // num seconds 
      'refreshToken' : accessCodeResponse.refresh_token // for getting new tokens
    };

    const currentUser = await this.databaseService.getUserByGoogleID(userID)
    currentUser.SpotifyAuth = spotifyAuth;

    const updatedUser = await this.databaseService.updateUser(currentUser);

    // send a new JWT token - this allows the user to go right into the app without having to log out and back in
    return {
      access_token: this.jwtService.sign({user: updatedUser}),
    }
  }

  

  async getSpotifyServerAuthCode() {
    if (this.currentCode && this.currentCode.expiresAt > Date.now()){
      return this.currentCode.code;
    } else {
      const call = {
        method: 'post' as any,
        url : 'https://accounts.spotify.com/api/token',
        headers: {
            'Authorization' : 'Basic ' + (new Buffer(process.env.SPOTIFY_CLIENT_ID + ':' + process.env.SPOTIFY_CLIENT_SECRET).toString('base64')),
            'Content-Type' : 'application/x-www-form-urlencoded'
        },
        params: {
            'grant_type': 'client_credentials'
        },
      };

      let result = await this.httpService.request(call).toPromise();

      this.currentCode = {
        'code': result.data.access_token,
        'expiresAt': this.getExpiryDate(result.data.expires_in)
      };

      return this.currentCode.code;
    }
  }

  getExpiryDate(expiresIn) {
    // return the actual date/time the token expires.
    // expiresIn, from spotify, is number of seconds until it expires.
    return new Date(Date.now() + expiresIn*1000);
  }
}