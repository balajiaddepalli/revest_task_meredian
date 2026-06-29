import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { lastValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject('USER_SERVICE') private readonly userClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    return lastValueFrom(this.userClient.send('register', dto));
  }

  async login(dto: LoginDto) {
    return lastValueFrom(this.userClient.send('login', dto));
  }

  async validateToken(token: string) {
    return lastValueFrom(this.userClient.send('validate_token', token));
  }
}
