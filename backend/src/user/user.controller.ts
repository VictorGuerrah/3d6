import { Controller } from '@nestjs/common';
import { BaseController } from '../base/base.controller';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
export class UserController extends BaseController<User, CreateUserDto, UpdateUserDto, UserResponseDto>(
  UserResponseDto,
  'user'
) {
  constructor(private readonly userService: UserService) {
    super(userService);
  }
}
