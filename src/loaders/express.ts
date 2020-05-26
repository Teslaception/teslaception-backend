import cors from 'cors';
import express from 'express';
import * as path from 'path';
import { NotFoundError, useExpressServer } from 'routing-controllers';
import Container from 'typedi';

import CurrentUserMiddleware from '../api/middlewares/attachCurrentUser';
import UserAuthenticationMiddleware from '../api/middlewares/isAuth';
import config from '../config';
import agendash from './agendash';

export default ({ app }: { app: express.Application }) => {
  /**
   * Health Check endpoints
   * @TODO Explain why they are here
   */
  app.get('/status', (_req, res) => {
    res.status(200).end();
  });
  app.head('/status', (_req, res) => {
    res.status(200).end();
  });

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy');

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors());

  // Middleware that transforms the raw string of req.body into json
  app.use(express.json());

  const authenticationMiddleware = Container.get(UserAuthenticationMiddleware);
  const currentUserMiddleware = Container.get(CurrentUserMiddleware);
  // Load API routes
  useExpressServer(app, {
    defaultErrorHandler: false, // replaced with error handler below.
    development: false, // If true, removes stack for errors
    routePrefix: config.api.prefix,
    controllers: [path.join(__dirname, '../api/controllers/*.ts')],
    authorizationChecker: authenticationMiddleware.userAuthentication.bind(authenticationMiddleware),
    currentUserChecker: currentUserMiddleware.getCurrentUser.bind(currentUserMiddleware),
  });

  // Load Agendash routes
  app.use(config.api.prefix, agendash());

  // catch 404 send appropriate error
  app.use((_req, res, next) => {
    if (!res.headersSent) {
      res.status(404);
      res.send({ errors: [new NotFoundError()] });
    } else {
      return next();
    }
  });

  app.use((err, _req, res, _next) => {
    // Catch errors that haven't been sent yet (like celebrate for example)
    // if (!res.headersSent) { // Add back if using the default handler
    res.status(err.status || err.httpCode || 500);
    res.json({
      errors: [
        {
          name: err.name,
          message: err.message,
        },
      ],
    });
    // }
    // If the error has already been sent by a framework (routing-controllers for example) then it is intercepted here and not spit out to the console
  });
};
