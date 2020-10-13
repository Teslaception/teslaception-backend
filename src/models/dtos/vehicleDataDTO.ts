// use class-transformer instead?
export type TVehicleDataDTO = {
  vehicle_id: number;
  state: string; //enum actually
  charge_state: {
    battery_heater_on: boolean;
    battery_level: number;
  };
};

// TODO: move all the DTOs and responses into interfaces
