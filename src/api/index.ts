import { Router } from "express";
import auth from "./routes/auth";
import user from "./routes/user";
import agendash from "./routes/agendash";
import test from "./routes/test";

// guaranteed to get dependencies
export default () => {
  const app = Router();
  auth(app);
  user(app);
  agendash(app);
  test(app);

  return app;
};
