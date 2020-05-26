import jwt from 'express-jwt';
import { Action } from 'routing-controllers';
import { Service } from 'typedi';

import config from '../../config';

/**
 * We are assuming that the JWT will come in a header with the form
 *
 * Authorization: Bearer ${JWT}
 *
 * But it could come in a query parameter with the name that you want like
 * GET https://my-bulletproof-api.com/stats?apiKey=${JWT}
 * Luckily this API follow _common sense_ ergo a _good design_ and don't allow that ugly stuff
 */
const getTokenFromHeader = (req) => {
  /**
   * @TODO Edge and Internet Explorer do some weird things with the headers
   * So I believe that this should handle more 'edge' cases ;)
   */
  if (
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
    (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
  ) {
    return req.headers.authorization.split(' ')[1];
  }
  return null;
};

@Service()
export default class UserAuthenticationMiddleware {
  public async userAuthentication(action: Action): Promise<boolean> {
    // solution 1

    const requestHandler = jwt({
      secret: config.jwtSecret,
      userProperty: 'token',
      getToken: getTokenFromHeader,
    });

    return new Promise((resolve) => {
      requestHandler(action.request, action.response, () => {
        // action.next(); // If I call next, it doesn't work. I don't know why

        resolve(!!action.request.token);
      });
    });

    // // solution 2 // works
    // const tokenSplit = action.request.headers["authorization"].split(" ");
    // const token = tokenSplit.length === 2 ? tokenSplit[1] : null;

    // return new Promise((resolve) => {
    //   verify(token, config.jwtSecret, null, (error, decoded) => {
    //     if (error) {
    //       action.response.status(401).send({ message: error.message }).end();
    //       resolve(false);
    //     } else {
    //       action.request.token = decoded; // don't need it in the previous solution as it's handled by requestHandler
    //       // action.next(); // it seems not necessary

    //       resolve(!!action.request.token);
    //     }
    //   });
    // });
  }
}
