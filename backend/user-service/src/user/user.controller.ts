import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UserService } from './user.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @MessagePattern('find_all_users')
  findAll(@Payload() payload?: { skip?: number; take?: number }) {
    return this.userService.findAll(payload);
  }

  @MessagePattern('register')
  register(@Payload() dto: RegisterDto) {
    return this.userService.register(dto);
  }

  @MessagePattern('login')
  login(@Payload() dto: LoginDto) {
    return this.userService.login(dto);
  }

  @MessagePattern('find_user_by_id')
  findById(@Payload() id: string) {
    return this.userService.findById(id);
  }

  @MessagePattern('find_user_by_email')
  findByEmail(@Payload() email: string) {
    return this.userService.findByEmail(email);
  }

  @MessagePattern('update_user')
  update(@Payload() data: { id: string; fullName?: string; gender?: string }) {
    return this.userService.update(data.id, { fullName: data.fullName, gender: data.gender });
  }

  @MessagePattern('validate_token')
  validateToken(@Payload() token: string) {
    return this.userService.validateToken(token);
  }
}
