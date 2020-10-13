import { Model } from 'mongoose';
import { Logger as WLogger } from 'winston';

import { IUser } from '../../interfaces/IUser';
import { IVehicle } from '../../interfaces/IVehicle';

declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser;
    }
  }

  namespace Models {
    export type UserModel = Model<IUser>;
    export type VehicleModel = Model<IVehicle>;
  }

  namespace Loggers {
    export type Logger = WLogger;
  }
}
