import mongoose from 'mongoose';

import { IVehicle } from '../interfaces/IVehicle';

const Vehicle = new mongoose.Schema(
  {
    vehicleId: {
      type: Number,
      required: [true, 'A vehicleId is required'],
    },

    // if I add the ID, will it collide?

    displayName: {
      type: String,
    },

    states: [
      {
        state: String,

        chargeState: {
          batteryLevel: Number,
        },

        timestamp: {
          type: Date,
        },
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model<IVehicle & mongoose.Document>('Vehicle', Vehicle);
