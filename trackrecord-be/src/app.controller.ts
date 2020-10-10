import { Controller, Get, UseGuards, Post, Request, Param, Query } from '@nestjs/common';
import { AppService } from './app.service';
//import { LocalAuthGuard } from './auth/local-auth.guard';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private authService: AuthService, private appService: AppService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @UseGuards(LocalAuthGuard)
  // @Post('auth/login')
  // async login(@Request() req) {
  //   return this.authService.login(req.user);
  // }

  // @Get('/google')
  // getGoogle() {
  //   return this.authService.getGoogleAuthToken('asdf');
  // }

}
