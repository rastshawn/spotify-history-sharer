import { Controller, Get, UseGuards, Post, Request, Body, HttpException } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {DatabaseService} from '../database/database.service'

function getExpiryDate(expiresIn) {
  // return the actual date/time the token expires.
  // expiresIn, from spotify, is number of seconds until it expires.
  return new Date(Date.now() + expiresIn*1000);
}

@Controller('/auth')
export class AuthController {
  constructor(private authService: AuthService, private databaseService: DatabaseService) {}

  // @UseGuards(JwtAuthGuard)
  // @Get()
  // getHello(): string {
  //   return this.appService.getHello();
  // }

  // @UseGuards(LocalAuthGuard)
  // @Post('/login')
  // async login(@Request() req) {
  //   return this.authService.login(req.user);
  // }

  @Post('/google/oauth')
  async getGoogle(@Body() body) {
    if (body.idtoken) {
      const response = await this.authService.googleLogin(body.idtoken);
      return response;
    } else {
      throw new HttpException("No idtoken", 400);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('/spotify/saveCode')
  async saveSpotifyCode(@Body() body) {
    body = body.body;
    if (body.code && body.userID) {
      // const response = await this.authService.googleLogin(body.idtoken);
      // return response;
      const accessCodeResponse = 
        await this.authService.getSpotifyAccessCode(body.code, body.userID);

      // update user in DB with new spotify access token
      let spotifyAuth = {
        'accessToken' : accessCodeResponse.access_token,
        'expiresAt' : getExpiryDate(accessCodeResponse.expires_in), // num seconds 
        'refreshToken' : accessCodeResponse.refresh_token // for getting new tokens
      };

      const currentUser = await this.databaseService.getUserByGoogleID(body.userID)
      currentUser.SpotifyAuth = spotifyAuth;

      return this.databaseService.updateUser(currentUser);
    } else {
      throw new HttpException("bad request", 400);
    }
  }

  @Get()
  getUsers(){
    return this.databaseService.getAll();
  }

}
