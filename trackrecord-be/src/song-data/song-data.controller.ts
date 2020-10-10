import { Controller, Get, UseGuards, Post, Request, Body, HttpException, Param, Query } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {DatabaseService} from '../database/database.service'
import { SongDataService } from './song-data.service';



@Controller('/songData')
export class SongDataController {
  constructor(private songDataService: SongDataService, private databaseService: DatabaseService) {}

  // unsecured endpoint for demo
  @Get(`/${process.env.DEMO_GOOGLE_ID}/last50`)
  async demoGetLast50(@Param() params) {
    return this.songDataService.getLast50(process.env.DEMO_GOOGLE_ID);
  }

  // unsecured endpoint for demo
  @Get(`/${process.env.DEMO_GOOGLE_ID}/history`)
  async demoGetHistory(@Param() params, @Query() query) {
    // console.log(params.userID);
    // console.log(query.from);
    // console.log(query.to);
    // const userID = params.userID;
    // if (query.from && query.to) {
    //   const from = new Date(query.from);
    //   const to = new Date(query.to);
    //   return this.databaseService.getHistoryByGoogleID(userID, to, from);
    // } else {
    //   return this.databaseService.getHistoryByGoogleID(userID);
    // }

    return this.songDataService.getHistory(process.env.DEMO_GOOGLE_ID, query.from, query.to);
    
  }



  @UseGuards(JwtAuthGuard)
  @Get('/:userID/last50')
  async getLast50(@Param() params) {
    return this.songDataService.getLast50(params.userID);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/:userID/history')
  async getHistory(@Param() params, @Query() query) {
    // console.log(params.userID);
    // console.log(query.from);
    // console.log(query.to);
    // const userID = params.userID;
    // if (query.from && query.to) {
    //   const from = new Date(query.from);
    //   const to = new Date(query.to);
    //   return this.databaseService.getHistoryByGoogleID(userID, to, from);
    // } else {
    //   return this.databaseService.getHistoryByGoogleID(userID);
    // }

    return this.songDataService.getHistory(params.userID, query.from, query.to);
    
  }

}
