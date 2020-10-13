import { Document } from 'mongoose';

// export interface IVehicle extends Document {
export interface IVehicle extends Document {
  // is it a document as well if it's embedded?
  vehicleId: string;
  displayName: string;
  states: Array<IVehicleState>;
  salt: string;
  teslaJwt?: string;
}

export interface IVehicleState {
  state: string;
  chargeState: IChargeState;
  timeStamp: Date;
}

export interface IChargeState {
  batteryLevel: number;
}
