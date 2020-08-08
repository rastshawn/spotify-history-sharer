// modified from NestJS Auth demo
import { Module, HttpModule } from '@nestjs/common';
//import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from '../auth/constants';
//import { JwtStrategy } from './jwt.strategy';
import { DatabaseModule } from '../database/database.module';
import { SongDataService } from './song-data.service';

@Module({
  imports: [
    HttpModule,
    DatabaseModule,
    PassportModule,
    UsersModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '2h' },
    }),
  ],
  providers: [SongDataService],
  exports: [SongDataService],
})
export class SongDataModule {}