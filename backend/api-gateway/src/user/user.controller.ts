import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Inject,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { lastValueFrom } from 'rxjs';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UserController {
  constructor(
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  @Roles('ADMIN')
  @ApiOperation({ operationId: 'listUsers', summary: 'List all users (admin only)' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Paginated user list' })
  @ApiResponse({ status: 403, description: 'Admin role required' })
  async findAll(@Query('skip') skip?: string, @Query('take') take?: string) {
    const params: any = {};
    if (skip) params.skip = parseInt(skip, 10);
    if (take) params.take = parseInt(take, 10);
    return lastValueFrom(this.client.send('find_all_users', params));
  }

  @Get('profile')
  @ApiOperation({ operationId: 'getMyProfile', summary: 'Get my profile' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  async getMyProfile(@Req() req: any) {
    return lastValueFrom(this.client.send('find_user_by_id', req.user.id));
  }

  @Put('profile')
  @ApiOperation({ operationId: 'updateMyProfile', summary: 'Update my profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  async updateMyProfile(@Body() dto: UpdateUserDto, @Req() req: any) {
    return lastValueFrom(this.client.send('update_user', { id: req.user.id, ...dto }));
  }

  /** @deprecated Use GET /users/profile */
  @Get('me')
  getMyProfileLegacy(@Req() req: any) {
    return this.getMyProfile(req);
  }

  /** @deprecated Use PUT /users/profile */
  @Put('me')
  updateMyProfileLegacy(@Body() dto: UpdateUserDto, @Req() req: any) {
    return this.updateMyProfile(dto, req);
  }

  @Get(':id')
  @ApiOperation({ operationId: 'getUser', summary: 'Get user profile by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 403, description: 'Not your profile' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string, @Req() req: any) {
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      throw new ForbiddenException('You can only view your own profile');
    }
    return lastValueFrom(this.client.send('find_user_by_id', id));
  }

  @Put(':id')
  @ApiOperation({ operationId: 'updateUser', summary: 'Update user profile' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Profile updated' })
  @ApiResponse({ status: 403, description: 'Not your profile' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: any,
  ) {
    if (req.user.role !== 'ADMIN' && req.user.id !== id) {
      throw new ForbiddenException('You can only update your own profile');
    }
    return lastValueFrom(this.client.send('update_user', { id, ...dto }));
  }
}
