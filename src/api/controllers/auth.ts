import { celebrate, Joi } from 'celebrate';
import { plainToClass } from 'class-transformer';
import { Authorized, BadRequestError, Body, HttpCode, JsonController, Post, UseBefore } from 'routing-controllers';
import { Container, Inject } from 'typedi';

import { TUserInputDTO } from '../../interfaces/IUser';
import { UserResponse } from '../../models/responses/userResponse';
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
  @HttpCode(201)
  async signup(@Body() userDTO: TUserInputDTO) {
    this.logger.debug('Calling Loggers.LoggerSign-Up endpoint with userDTP: %o', userDTO);
    try {
      const authServiceInstance = Container.get(AuthService); // I should inject the Auth Service
      const { user, token } = await authServiceInstance.SignUp(
        userDTO, // maybe that wouldn't be necessary using class-transformer
      );

      return {
        user: plainToClass(UserResponse, user, {
          strategy: 'excludeAll',
          enableImplicitConversion: true,
        }),
        token,
      };
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
  async signin(@Body() { email, password }: { email: string; password: string }) {
    this.logger.debug('Calling Sign-In endpoint with: %s and %s', email, password);
    try {
      const authServiceInstance = Container.get(AuthService);
      const { user, token } = await authServiceInstance.SignIn(email, password);
      return {
        user: plainToClass(UserResponse, user, {
          strategy: 'excludeAll',
          enableImplicitConversion: true,
        }),
        token,
      };
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
  @Post('/logout')
  @Authorized()
  logout() {
    this.logger.debug('Calling Sign-Out endpoint');
    try {
      //@TODO AuthService.Logout(req.user) do some clever stuff
      return null; // TODO: Need to use routing-controllers instead
    } catch (error) {
      this.logger.error('🔥 error %o', error);
      throw new BadRequestError(error.message);
    }
  }
}
