import { Router } from "express";
import Container from "typedi";
import basicAuth from "express-basic-auth";
import config from "../config";
import agendash from "agendash";

export default () => {
  const app = Router();

  const agendaInstance = Container.get("agendaInstance");

  app.use(
    "/dash",
    basicAuth({
      users: {
        [config.agendash.user]: config.agendash.password,
      },
      challenge: true,
    }),
    agendash(agendaInstance)
  );

  return app;
};
