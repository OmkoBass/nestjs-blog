import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtGuard } from 'src/auth/guard';
import { GetUser } from '../auth/decorator/index';
import { User } from '@prisma/client';

@UseGuards(JwtGuard)
@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/loggedIn')
  getLoggedIn(@GetUser() user: User) {
    return this.userService.getUser(user.id);
  }
}
