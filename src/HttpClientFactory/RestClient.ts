import fetch, { Response as FetchResponse } from 'node-fetch';
import { ForbiddenError, HttpError, NotFoundError, UnauthorizedError } from 'routing-controllers';
import Container from 'typedi';

export default class RestClient {
  // @Inject("logger") private logger: Loggers.Logger;
  private logger: Loggers.Logger;

  constructor(private baseURL: string, private defaultHeaders: { [key: string]: string }) {
    this.logger = Container.get('logger');
  }

  public async get(
    requestPath: string,
    queryParams: { [key: string]: string } = {},
    requestHeaders: { [key: string]: string } = {}, // HeadersInit
  ): Promise<FetchResponse> {
    this.logger.info('url: %s', this.getFullURL(requestPath, queryParams)); // I have a 500 not well handled
    return fetch(this.getFullURL(requestPath, queryParams), {
      method: 'GET',
      headers: { ...this.defaultHeaders, ...requestHeaders },
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        this.handleError(error);
      });
  }

  public async put(
    requestPath: string,
    requestBody: any,
    requestHeaders: { [key: string]: string },
  ): Promise<FetchResponse> {
    return fetch(this.getFullURL(requestPath), {
      method: 'PUT',
      body: requestBody,
      headers: { ...this.defaultHeaders, ...requestHeaders },
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        this.handleError(error);
      });
  }

  public async post(
    requestPath: string,
    requestBody: any,
    requestHeaders: { [key: string]: string },
  ): Promise<FetchResponse> {
    this.logger.debug('Calling post with url: %s and body: %o', this.getFullURL(requestPath), requestBody);
    try {
      const response = await fetch(this.getFullURL(requestPath), {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { ...this.defaultHeaders, ...requestHeaders },
      });

      this.logger.debug('Received: %o', response);
      return response;
    } catch (error) {
      this.handleError(error);
    }
  }

  public async delete(
    requestPath: string,
    requestBody: any,
    requestHeaders: { [key: string]: string },
  ): Promise<FetchResponse> {
    return fetch(this.getFullURL(requestPath), {
      method: 'DELETE',
      body: requestBody,
      headers: { ...this.defaultHeaders, ...requestHeaders },
    })
      .then((response) => {
        return response.json();
      })
      .catch((error) => {
        this.handleError(error);
      });
  }

  private handleError(error: any) {
    // any?
    this.logger.info('Received error from upstream service: ' + error);

    // handle situations where standard JSONAPI formatting is used for errors
    // this is a temp fix until the core services uses a unified format for all errors
    if (error.errors && error.errors.length) {
      error.response = { status: error.errors[0].status };
    }

    const response = error.response;
    if (!response) {
      this.logger.info('Received unexpected error from upstream service. ');
      for (const a in error) {
        this.logger.info('In payload: ' + a);
      }
      throw new HttpError(503, 'Received an unexpected mal-formed error from an upstream service.');
    }

    const status = response.status;

    if (status === 401) {
      throw new UnauthorizedError('Remote - Authorization required');
    }

    if (status === 403) {
      throw new ForbiddenError('Remote - Forbidden');
    }

    if (status === 404) {
      throw new NotFoundError('Remote - Not found');
    }

    const moddedStatus = status % 500;

    if (moddedStatus > 0 && moddedStatus < 100) {
      throw new HttpError(503, 'Up stream service responded with a 5xx response.');
    }

    throw new HttpError(500, 'Received an error from upstream service with status ' + status);
  }

  private getFullURL(path: string, params?: { [key: string]: string }): string {
    return params && Object.keys(params).length
      ? Object.keys(params).reduce((query, paramKey, index) => {
          return `${query}${index !== 0 ? '&' : ''}${paramKey}=${params[paramKey]}`;
        }, `${this.baseURL}${path}?`)
      : `${this.baseURL}${path}`;
  }
}
