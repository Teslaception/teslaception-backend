import { Document } from 'mongoose';

import { IVehicle } from './IVehicle';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  salt: string;
  teslaJwt?: string;
  vehicles: Array<IVehicle>;
}

export type TUserInputDTO = Pick<IUser, 'name' | 'email' | 'password'>;
