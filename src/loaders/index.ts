import expressLoader from "./express";
import dependencyInjectorLoader from "./dependencyInjector";
import mongooseLoader from "./mongoose";
import jobsLoader from "./jobs";
import Logger from "./logger";
//We have to import at least all the events once so they can be triggered
import "./events";
import modelsInjectorLoader from "./modelsInjector";

export default async ({ expressApp }) => {
  const mongoConnection = await mongooseLoader();
  Logger.info("✌️ DB loaded and connected!");

  await injectModels(); // funny I can do that here, is that thanks to ts? hoisted?
  Logger.info("✌️ Models Injector loaded!");

  const { agenda } = await dependencyInjectorLoader({
    mongoConnection,
  });
  Logger.info("✌️ Dependency Injector loaded");

  await jobsLoader({ agenda });
  Logger.info("✌️ Jobs loaded");

  await expressLoader({ app: expressApp });
  Logger.info("✌️ Express loaded");
};

const injectModels = async () => {
  /**
   * WTF is going on here?
   *
   * We are injecting the mongoose models into the DI container.
   * I know this is controversial but will provide a lot of flexibility at the time
   * of writing unit tests, just go and check how beautiful they are!
   */
  const userModel = {
    name: "userModel",
    // Notice the require syntax and the '.default'
    model: require("../models/user").default,
  };

  await modelsInjectorLoader([
    userModel,
    // salaryModel,
    // whateverModel
  ]);
};
