import { Document, Model } from 'mongoose';
import { Logger as WLogger } from 'winston';

import { IUser } from '../../interfaces/IUser';

declare global {
  namespace Express {
    export interface Request {
      currentUser: IUser & Document;
    }
  }

  namespace Models {
    export type UserModel = Model<IUser & Document>;
  }

  namespace Loggers {
    export type Logger = WLogger;
  }
}
