// modified from NestJS Auth demo
import { Module, HttpModule } from '@nestjs/common';
import { AuthService } from './auth.service';
//import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt.strategy';
import {DatabaseService} from '../users/database.service'

@Module({
  imports: [
    HttpModule,
    PassportModule,
    UsersModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '2h' },
    }),
    
  ],
  providers: [AuthService, /*LocalStrategy,*/ JwtStrategy, DatabaseService],
  exports: [AuthService, DatabaseService],
})
export class AuthModule {}