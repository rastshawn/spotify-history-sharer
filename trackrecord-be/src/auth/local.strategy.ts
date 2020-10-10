// from NestJS Auth demo
import { Strategy } from 'passport-http-bearer';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({passReqToCallback: true});
  }

  // Only accept local requests that have the correct api key
  async validate(request: any, token: string): Promise<any> {
    const isLocalhost = (request.headers.host.indexOf('localhost') === 0);
    const tokenMatch = (token === process.env.FETCHER_TOKEN); // TODO this is probably not good practice
    if (isLocalhost && tokenMatch) {
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}