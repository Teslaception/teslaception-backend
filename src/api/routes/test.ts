import { Router, Request, Response } from "express";
const route = Router();

export default (app: Router) => {
  app.use("/test", route);

  route.get("/", (req: Request, res: Response) => {
    return res.send("Yeah that works");
  });
};
