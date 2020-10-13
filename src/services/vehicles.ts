import { Response as FetchResponse } from 'node-fetch';
import { ForbiddenError, HttpError, UnauthorizedError } from 'routing-controllers';
import { Inject, Service } from 'typedi';

import { IUser } from '../interfaces/IUser';
import { IVehicleState } from '../interfaces/IVehicle';
import { TVehicleDTO } from '../models/dtos/vehicleDTO';
import TeslaService from './clients/teslaService';

@Service()
export default class VehicleService {
  constructor(
    private teslaService: TeslaService,
    @Inject('logger') private logger: Loggers.Logger,
    @Inject('userModel') private userModel: Models.UserModel,
    @Inject('vehicleModel') private vehicleModel: Models.VehicleModel,
  ) {}

  async getVehicles(user: IUser): Promise<Array<TVehicleDTO>> {
    this.logger.debug('Calling getVehicle method with user: %o', user);

    if (!user.teslaJwt) {
      throw new ForbiddenError('tesla jwt required');
    }

    return this.teslaService.getVehicles(user.teslaJwt);
    // ADD ERROR HANDLING
    // UNWRAP THE RESPONSE
  }

  async getLatestVehicleData(vehicleId: string) {
    this.logger.debug('Calling getLatestVehicleData method with vehicleId: %o', vehicleId);

    const vehicleData = await this.teslaService.getVehicleData(vehicleId);

    let databaseStatus;
    try {
      const vehicleState: IVehicleState = {
        state: vehicleData.state,
        chargeState: {
          batteryLevel: vehicleData.charge_state.battery_level,
        },
        timeStamp: new Date(),
      };
      databaseStatus = await this.vehicleModel.findOneAndUpdate(
        { vehicleId: vehicleId },
        { $push: { states: vehicleState } },
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
