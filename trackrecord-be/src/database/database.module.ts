// from NestJS Auth demo
import { Module, HttpModule } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  providers: [HttpModule, DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}