import { plainToClass } from 'class-transformer';
import { Authorized, BodyParam, CurrentUser, Get, JsonController, Post } from 'routing-controllers';
import { Inject } from 'typedi';

import { IUser } from '../../interfaces/IUser';
import { UserResponse } from '../../models/responses/userResponse';
import UserService from '../../services/user';

@JsonController('/users')
export class UsersController {
  constructor(
    @Inject('logger') private logger: Loggers.Logger,
    private userService: UserService, // with or without inject?
  ) {}

  @Authorized()
  @Get('/me')
  get(@CurrentUser() user?: IUser) {
    return plainToClass(UserResponse, user, {
      strategy: 'excludeAll',
      enableImplicitConversion: true,
    });
  }

  @Authorized()
  @Post('/generate-tesla-jwt')
  postGenerateJwt(
    @BodyParam('email') email: string,
    @BodyParam('password') password: string,
    @CurrentUser() user?: IUser,
  ) {
    // what happens if user is null? Is that even possible?

    this.logger.debug('Calling generate-tesla-jwt endpoint');

    return this.userService.getTeslaToken(email, password, user); // is await needed?
  }

  @Authorized()
  @Post('/refresh-vehicles')
  refreshVehicles(@CurrentUser() user?: IUser) {
    // what happens if user is null? Is that even possible?

    return this.userService.refreshVehicles(user); // is await needed?
  }
}
