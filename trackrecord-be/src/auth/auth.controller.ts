import { Controller, Get, UseGuards, Post, Request, Body, HttpException } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {DatabaseService} from '../database/database.service'

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

  @Post('/spotify/saveCode')
  async saveSpotifyCode(@Body() body) {
    if (body.code && body.userID) {
      // const response = await this.authService.googleLogin(body.idtoken);
      // return response;
    } else {
      throw new HttpException("bad request", 400);
    }
  }

  @Get()
  getUsers(){
    return this.databaseService.getAll();
  }

}
