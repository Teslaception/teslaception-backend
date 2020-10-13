import mongoose from 'mongoose';

import { IUser } from '../interfaces/IUser';
import vehicle from './vehicle';

const User = new mongoose.Schema(
  {
    // What happens if I add _id?
    // And createdAt and updatedAt?
    name: {
      type: String,
      required: [true, 'Please enter a full name'],
      index: true,
    },

    email: {
      type: String,
      lowercase: true,
      unique: true,
      index: true,
    },

    password: String,

    salt: String,

    teslaJwt: String,

    role: {
      type: String,
      default: 'user',
    },

    // vehicles: [vehicle.modelName],
    vehicles: [vehicle.schema],
    // vehicles: {
    //   type: Array,
    // },
  },
  { timestamps: true },
);

export default mongoose.model<IUser & mongoose.Document>('User', User);
