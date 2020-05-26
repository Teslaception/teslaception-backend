import { plainToClass } from 'class-transformer';
import { Authorized, CurrentUser, Get, JsonController } from 'routing-controllers';

import { IUser } from '../../interfaces/IUser';
import { UserDTO } from '../../models/userDTO';

@JsonController('/users')
export class UsersController {
  @Authorized()
  @Get('/me')
  get(@CurrentUser() user?: IUser) {
    return plainToClass(UserDTO, user, {
      strategy: 'excludeAll',
      enableImplicitConversion: true,
    });
  }
}
