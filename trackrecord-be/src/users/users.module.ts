// from NestJS Auth demo
import { Module, HttpModule } from '@nestjs/common';
import { UsersService } from './users.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  providers: [HttpModule, UsersService],
  exports: [UsersService],
  imports: [DatabaseModule]
})
export class UsersModule {}