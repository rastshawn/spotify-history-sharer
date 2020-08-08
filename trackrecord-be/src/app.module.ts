import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AuthController } from './auth/auth.controller'
import { DatabaseModule } from './database/database.module';
import { SongDataModule } from './song-data/song-data.module';
import { SongDataController } from './song-data/song-data.controller';

@Module({
  imports: [AuthModule, UsersModule, DatabaseModule, SongDataModule],
  controllers: [AppController, AuthController, SongDataController],
  providers: [AppService],
})
export class AppModule {}
