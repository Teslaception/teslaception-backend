import { Response as FetchResponse } from 'node-fetch';
import { ForbiddenError, HttpError, UnauthorizedError } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { IUser } from '../interfaces/IUser';
import TeslaService from './clients/teslaService';
import VehicleService from './vehicles';

@Service()
export default class UserService {
  constructor(
    private teslaService: TeslaService,
    private vehicleService: VehicleService,
    @Inject('logger') private logger: Loggers.Logger,
    @Inject('userModel') private userModel: Models.UserModel,
  ) {}

  async getTeslaToken(email: string, password: string, user: IUser) {
    this.logger.debug(
      'Calling getTeslaToken method with user: %o and email: %o and password: %o',
      user,
      email,
      password,
    );

    const responseContent = await this.teslaService.getTeslaToken(email, password);

    let databaseStatus;
    try {
      databaseStatus = await this.userModel.updateOne(
        { name: user.name, email: user.email },
        { teslaJwt: responseContent.access_token },
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

  async refreshVehicles(user: IUser) {
    this.logger.debug('COUCOU 0a');
    const vehiclesDTO = await this.vehicleService.getVehicles(user);
    this.logger.debug('COUCOU 0b');
    this.logger.debug('%o', vehiclesDTO.response);

    let databaseStatus;
    try {
      // How can I use a type for that?
      const vehicles = vehiclesDTO.response.map((vehicleDTO) => ({
        vehicleId: vehicleDTO.vehicle_id,
        displayName: vehicleDTO.display_name,
      })); // should use a transformer to transform the DTO into the domain object
      this.logger.debug('COUCOU 1');
      this.logger.debug('vehicles = %o', vehicles);
      const userDB = await this.userModel.findOne({ name: user.name, email: user.email });
      this.logger.debug('COUCOU 2');
      this.logger.debug(userDB);

      userDB.vehicles = vehicles;
      const databaseStatus = await userDB.save();
      this.logger.debug('COUCOU 3');
      this.logger.debug('Database: %o', databaseStatus);
    } catch (error) {
      throw new HttpError(511, 'An unexpected error has occured.');
    }

    if (databaseStatus.nModified === 1) {
      return null; // return vehicles?
    } else {
      throw new HttpError(511, 'An unexpected error has occured.');
    }
  }
}
