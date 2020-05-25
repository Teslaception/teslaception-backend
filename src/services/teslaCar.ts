import { Service, Inject } from "typedi";
import { Response as FetchResponse } from "node-fetch";
import jwt from "jsonwebtoken";
import MailerService from "./mailer";
import config from "../config";
import argon2 from "argon2";
import { randomBytes } from "crypto";
import { IUser, IUserInputDTO } from "../interfaces/IUser";
import {
  EventDispatcher,
  EventDispatcherInterface,
} from "../decorators/eventDispatcher";
import events from "../subscribers/events";
import RestClient from "../HttpClientFactory/RestClient";
import HttpClientFactory from "../HttpClientFactory/HttpClientFactory";
import {
  ForbiddenError,
  BadRequestError,
  HttpError,
  InternalServerError,
  UnauthorizedError,
} from "routing-controllers";
import { response } from "express";

@Service()
export default class TeslaCarService {
  constructor(
    @Inject("teslaCarHttpClient") private teslaCarHttpClient: RestClient,
    @Inject("logger") private logger: Loggers.Logger,
    @Inject("userModel") private userModel: Models.UserModel,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  async getVehicles(user: IUser) {
    this.logger.debug("Calling getVehicle method with user: %o", user);

    if (!user.teslaJwt) {
      throw new ForbiddenError("tesla jwt required");
    }

    const requestHeaders = {
      Authorization: `Bearer ${user.teslaJwt}`,
    };

    return this.teslaCarHttpClient.get("/api/1/vehicles", {}, requestHeaders);
  }

  async getTeslaToken(email: string, password: string, user: IUser) {
    this.logger.debug(
      "Calling getTeslaToken method with user: %o and email: %o and password: %o",
      user,
      email,
      password
    );

    const requestBody = {
      grant_type: "password",
      client_id: process.env.TESLA_CLIENT_ID,
      client_secret: process.env.TESLA_CLIENT_SECRET,
      email,
      password,
    };

    let response: FetchResponse;
    // access_token: '335c05509b8f28bad0a686fd57434baaf5560b6918c503d880e8f0c7f9413b32',
    // token_type: 'bearer',
    // expires_in: 3888000,
    // refresh_token: 'f7e423ee9c8d2378772a8d20a990c42e265aeef098c04c7bf28c6a26d15ee2f2',
    // created_at: 1589869902
    try {
      response = await this.teslaCarHttpClient.post(
        "/oauth/token",
        requestBody,
        {}
      );

      this.logger.debug("Received response from Tesla: %o", response);
    } catch (error) {
      this.logger.debug("Received error from Tesla Client: %o", error);
      throw new HttpError(
        503,
        "Received an unexpected mal-formed error from an upstream service."
      );
    }

    if (response.status >= 400) {
      if (response.status === 401) {
        throw new UnauthorizedError(
          "Incorrect credentials supplied to Tesla API"
        );
      } else {
        throw new HttpError(
          503,
          "Received an unexpected mal-formed error from an upstream service."
        );
      }
    } else {
      let databaseStatus;
      try {
        const responseContent = await response.json();

        databaseStatus = await this.userModel.updateOne(
          { name: user.name, email: user.email },
          { teslaJwt: responseContent.access_token }
        );
        this.logger.debug("Database: %o", databaseStatus);
      } catch (error) {
        throw new HttpError(511, "An unexpected error has occured.");
      }

      if (databaseStatus.nModified === 1) {
        return null;
      } else {
        throw new HttpError(511, "An unexpected error has occured.");
      }
    }
  }
}
