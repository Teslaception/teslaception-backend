import { Response as FetchResponse } from 'node-fetch';
import { HttpError, UnauthorizedError } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import RestClient from '../../HttpClientFactory/RestClient';
import { IVehicleState } from '../../interfaces/IVehicle';
import { TVehicleDataDTO } from '../../models/dtos/vehicleDataDTO';
import { TVehicleDTO } from '../../models/dtos/vehicleDTO';

@Service()
export default class TeslaService {
  constructor(
    @Inject('teslaHttpClient') private teslaHttpClient: RestClient,
    @Inject('logger') private logger: Loggers.Logger,
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('vehicleModel') private vehicleModel: Models.VehicleModel,
  ) {}

  async getVehicles(teslaJwt: string): Promise<Array<TVehicleDTO>> {
    this.logger.debug('Calling getVehicle method with teslaJwt: %o', teslaJwt);

    const requestHeaders = {
      Authorization: `Bearer ${teslaJwt}`,
    };

    // needs handler for errors? Needs to do that with every request? Probably

    let response: FetchResponse;
    try {
      response = await this.teslaHttpClient.get('/api/1/vehicles', {}, requestHeaders);

      // this.logger.debug('Received response from Tesla: %o', response);
    } catch (error) {
      this.logger.debug('Received error from Tesla Client: %o', error);
      throw new HttpError(503, 'Received an unexpected mal-formed error from an upstream service.');
    }

    if (response.status >= 400) {
      if (response.status === 401) {
        throw new UnauthorizedError('Incorrect credentials supplied to Tesla API');
      } else {
        throw new HttpError(503, 'Received an unexpected mal-formed error from an upstream service.');
      }
    }

    let responseContent;
    try {
      responseContent = await response.json(); // There should be a cast, maybe with the library to parse, to get the object in the right interface
      // this.logger.debug('Received Content from Tesla: %o', responseContent);
    } catch (error) {
      throw new HttpError(511, 'An unexpected error has occured.');
    }

    return responseContent;
  }

  async getTeslaToken(email: string, password: string) {
    this.logger.debug('Calling getTeslaToken method with email: %o and password: %o', email, password);

    const requestBody = {
      grant_type: 'password',
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
      response = await this.teslaHttpClient.post('/oauth/token', requestBody, {});

      this.logger.debug('Received response from Tesla: %o', response);
    } catch (error) {
      this.logger.debug('Received error from Tesla Client: %o', error);
      throw new HttpError(503, 'Received an unexpected mal-formed error from an upstream service.');
    }

    if (response.status >= 400) {
      if (response.status === 401) {
        throw new UnauthorizedError('Incorrect credentials supplied to Tesla API');
      } else {
        throw new HttpError(503, 'Received an unexpected mal-formed error from an upstream service.');
      }
    }

    let responseContent;
    try {
      responseContent = await response.json();
    } catch (error) {
      throw new HttpError(511, 'An unexpected error has occured.');
    }

    return responseContent;
  }

  async getAllVehicles(vehicleId: string) {
    this.logger.debug('Calling getVehicleData method with vehicleId: %o', vehicleId);

    const requestBody = {
      grant_type: 'password',
      client_id: process.env.TESLA_CLIENT_ID,
      client_secret: process.env.TESLA_CLIENT_SECRET,
    };

    let response: FetchResponse;
    try {
      response = await this.teslaHttpClient.get(`/api/1/vehicles/%{vehicleId}/vehicle_data`, requestBody, {});

      //   {
      //     "response": null,
      //     "error": "vehicle unavailable: {:error=>\"vehicle unavailable:\"}",
      //     "error_description": ""
      // }

      this.logger.debug('Received response from Tesla: %o', response);
    } catch (error) {
      this.logger.debug('Received error from Tesla Client: %o', error);
      throw new HttpError(503, 'Received an unexpected mal-formed error from an upstream service.');
    }

    let responseContent;
    try {
      responseContent = await response.json();
    } catch (error) {
      throw new HttpError(511, 'An unexpected error has occured.');
    }

    if (response.status >= 400 || responseContent.error) {
      if (responseContent.error) {
        throw new UnauthorizedError(`Error received from Tesla API: ${responseContent.error}`);
      } else {
        throw new HttpError(503, 'Received an unexpected mal-formed error from an upstream service.');
      }
    } else {
      let databaseStatus;
      try {
        const state: IVehicleState = {
          state: responseContent.state,
          chargeState: {
            batteryLevel: responseContent.charge_state.battery_level,
          },
          timeStamp: new Date(),
        };
        databaseStatus = await this.vehicleModel.findOneAndUpdate(
          { vehicleId: vehicleId },
          { $push: { states: state } },
        );
        this.logger.debug('Database: %o', databaseStatus);
      } catch (error) {
        throw new HttpError(511, 'An unexpected error has occured.');
      }

      if (databaseStatus.nModified === 1) {
        return null;
      } else {
        throw new HttpError(511, 'An unexpected error has occured.');
      }
    }
  }

  async getVehicleData(vehicleId: string): Promise<TVehicleDataDTO> {
    this.logger.debug('Calling getVehicleData method with vehicleId: %o', vehicleId);

    const requestBody = {
      grant_type: 'password',
      client_id: process.env.TESLA_CLIENT_ID,
      client_secret: process.env.TESLA_CLIENT_SECRET,
    };

    let response: FetchResponse;
    try {
      response = await this.teslaHttpClient.get(`/api/1/vehicles/%{vehicleId}/vehicle_data`, requestBody, {});

      //   {
      //     "response": null,
      //     "error": "vehicle unavailable: {:error=>\"vehicle unavailable:\"}",
      //     "error_description": ""
      // }

      this.logger.debug('Received response from Tesla: %o', response);
    } catch (error) {
      this.logger.debug('Received error from Tesla Client: %o', error);
      throw new HttpError(503, 'Received an unexpected mal-formed error from an upstream service.');
    }

    let responseContent;
    try {
      responseContent = await response.json();
    } catch (error) {
      throw new HttpError(511, 'An unexpected error has occured.');
    }

    if (response.status >= 400 || responseContent.error) {
      if (responseContent.error) {
        throw new UnauthorizedError(`Error received from Tesla API: ${responseContent.error}`);
      } else {
        throw new HttpError(503, 'Received an unexpected mal-formed error from an upstream service.');
      }
    }

    return responseContent;
  }
}
