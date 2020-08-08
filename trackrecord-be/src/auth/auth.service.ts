// modified from NestJS Auth demo
import { Injectable, HttpService } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';



@Injectable()
export class AuthService {
  private currentCode;
  constructor(private httpService: HttpService, private usersService: UsersService, private jwtService: JwtService) {}

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
    const user = await this.usersService.getUserByGoogleID(googleUserID);
    
    console.log(user);

    if (user) {
      return {
        access_token: this.jwtService.sign({user: user}),
      }
    } else {
      // user does not exist in database
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


  async getSpotifyAccessCode(loginAuthCode: string, userID: string){
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
  
    return result.data;
  }

  async getServerAuthCode() {
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