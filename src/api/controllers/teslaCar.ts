import { celebrate, Joi } from 'celebrate';
import { Authorized, BodyParam, CurrentUser, Get, JsonController, Post, UseBefore } from 'routing-controllers';

import { IUser } from '../../interfaces/IUser';
import TeslaCarService from '../../services/teslaCar';

@JsonController('/tesla-car')
export class UsersController {
  constructor(
    private teslaCarService: TeslaCarService, // with or without inject?
  ) {}

  @Authorized()
  @Get('/vehicles')
  getVehicles(@CurrentUser() user?: IUser) {
    // what happens if there's no user given?

    return this.teslaCarService.getVehicles(user);
  }

  @Authorized()
  @UseBefore(
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
  )
  @Post('/generate-jwt')
  postGenerateJwt(
    @BodyParam('email') email: string,
    @BodyParam('password') password: string,
    @CurrentUser() user?: IUser,
  ) {
    // what happens if user is null? Is that even possible?

    return this.teslaCarService.getTeslaToken(email, password, user); // is await needed?
  }
}
