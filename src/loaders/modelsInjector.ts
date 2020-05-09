import { Container } from "typedi";
import LoggerInstance from "./logger";

type TInjectedModel = {
  name: string;
  model: any;
};

export default (models: Array<TInjectedModel>) => {
  try {
    models.forEach((model: TInjectedModel) => {
      Container.set(model.name, model.model);
    });

    LoggerInstance.info("✌️ Models injected into container");
  } catch (error) {
    LoggerInstance.error("🔥 Error on models injector loader: %o", error);
    throw error;
  }
};
