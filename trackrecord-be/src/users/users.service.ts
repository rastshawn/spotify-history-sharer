// from NestJS Auth demo
import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { User } from 'src/types/user.dto';

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



