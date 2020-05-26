import { celebrate, Joi } from 'celebrate';
import { Request, Response } from 'express';
import { Authorized, BadRequestError, JsonController, Post, Req, Res, UseBefore } from 'routing-controllers';
import { Container, Inject } from 'typedi';

import { IUserInputDTO } from '../../interfaces/IUser';
import AuthService from '../../services/auth';

@JsonController('/auth')
export class AuthController {
  constructor(@Inject('logger') private logger: Loggers.Logger) {}

  @Post('/signup')
  @UseBefore(
    celebrate({
      body: Joi.object({
        name: Joi.string().required(),
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
  )
  async signup(@Req() request: Request, @Res() response: Response) {
    // TODO: Need to use routing-controllers instead
    this.logger.debug('Calling Loggers.LoggerSign-Up endpoint with body: %o', request.body);
    try {
      const authServiceInstance = Container.get(AuthService); // I should inject the Auth Service
      const { user, token } = await authServiceInstance.SignUp(
        request.body as IUserInputDTO, // maybe that wouldn't be necessary using class-transformer
      );
      return response.status(201).json({ user, token }); // TODO: Need to use routing-controllers instead
    } catch (error) {
      this.logger.error('🔥 error: %o', error);
      throw new BadRequestError(error.message);
    }
  }

  @Post('/signin')
  @UseBefore(
    celebrate({
      body: Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
      }),
    }),
  )
  async signin(@Req() request: Request, @Res() response: Response) {
    // TODO: Need to use routing-controllers instead
    this.logger.debug('Calling Sign-In endpoint with body: %o', request.body);
    try {
      const { email, password } = request.body;
      const authServiceInstance = Container.get(AuthService);
      const { user, token } = await authServiceInstance.SignIn(email, password);
      return response.json({ user, token }).status(200); // TODO: Need to use routing-controllers instead
    } catch (error) {
      this.logger.error('🔥 error: %o', error);
      throw new BadRequestError(error.message);
    }
  }

  /**
   * @TODO Let's leave this as a place holder for now
   * The reason for a logout route could be deleting a 'push notification token'
   * so the device stops receiving push notifications after logout.
   *
   * Another use case for advance/enterprise apps, you can store a record of the jwt token
   * emitted for the session and add it to a black list.
   * It's really annoying to develop that but if you had to, please use Redis as your data store
   */
  @Post('logout')
  @Authorized()
  logout(@Req() request: Request, @Res() response: Response) {
    // TODO: Need to use routing-controllers instead
    this.logger.debug('Calling Sign-Out endpoint with body: %o', request.body);
    try {
      //@TODO AuthService.Logout(req.user) do some clever stuff
      return response.status(200).end(); // TODO: Need to use routing-controllers instead
    } catch (error) {
      this.logger.error('🔥 error %o', error);
      throw new BadRequestError(error.message);
    }
  }
}
