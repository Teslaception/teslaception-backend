import { celebrate, Joi } from 'celebrate';
import { Authorized, BodyParam, CurrentUser, Get, JsonController, Post, UseBefore } from 'routing-controllers';

import { IUser } from '../../interfaces/IUser';
import VehicleService from '../../services/vehicles';

@JsonController('/vehicles')
export class UsersController {
  constructor(
    private vehicleService: VehicleService, // with or without inject?
  ) {}

  @Authorized()
  @Get('/') // or just nothing?
  get(@CurrentUser() user?: IUser) {
    // return plainToClass(UserResponse, user, {
    //   strategy: 'excludeAll',
    //   enableImplicitConversion: true,
    // });
  }
}
