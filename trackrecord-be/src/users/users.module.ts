// from NestJS Auth demo
import { Module, HttpModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseService } from './database.service';

@Module({
  providers: [HttpModule, UsersService, DatabaseService],
  exports: [UsersService],
})
export class UsersModule {}