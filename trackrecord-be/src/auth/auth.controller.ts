import { Controller, Get, UseGuards, Post, Request, Body, HttpException } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import {DatabaseService} from '../users/database.service'

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
  getGoogle(@Body() body) {
    if (body.idtoken) {
      return this.authService.googleLogin(body.idtoken);
    } else {
      throw new HttpException("No idtoken", 400);
    }
  }

  @Get()
  getUsers(){
    return this.databaseService.getAll();
  }

}
