import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
// from NestJS Auth demo
export class JwtAuthGuard extends AuthGuard('jwt') {}