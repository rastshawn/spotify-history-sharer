// modified from NestJS Auth demo
import { Injectable, HttpService } from '@nestjs/common';
import { User, UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
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
}