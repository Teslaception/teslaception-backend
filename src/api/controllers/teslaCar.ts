import {
  Get,
  Authorized,
  CurrentUser,
  JsonController,
  Res,
  Controller,
  UseBefore,
  BadRequestError,
  Post,
  QueryParam,
  BodyParam,
} from "routing-controllers";
import { IUser } from "../../interfaces/IUser";
import { Response } from "express";
import { plainToClass } from "class-transformer";
import { UserDTO } from "../../models/userDTO";
import { Inject } from "typedi";
import TeslaCarService from "../../services/teslaCar";
import { celebrate, Joi } from "celebrate";

@JsonController("/tesla-car")
export class UsersController {
  constructor(
    @Inject("logger") private logger: Loggers.Logger,
    private teslaCarService: TeslaCarService // with or without inject?
  ) {}

  @Authorized()
  @Get("/vehicles")
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
    })
  )
  @Post("/generate-jwt")
  postGenerateJwt(
    @BodyParam("email") email: string,
    @BodyParam("password") password: string,
    @CurrentUser() user?: IUser
  ) {
    // what happens if user is null? Is that even possible?

    return this.teslaCarService.getTeslaToken(email, password, user); // is await needed?
  }
}
