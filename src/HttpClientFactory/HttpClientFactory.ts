import RestClient from "./RestClient";

export default class HttpClientFactory {
  public createRestClient(
    baseURL: string,
    apiSecrets?: Array<{ secretKey: string; secret: string }>
  ) {
    const defaultHeaders = {
      // necessary?
      // Authorization: "allow",
      // "Cache-Control": "max-age=0",
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (apiSecrets && apiSecrets.length) {
      apiSecrets.forEach((apiSecret) => {
        defaultHeaders[apiSecret.secretKey] = apiSecret.secret;
      });
    }

    return new RestClient(baseURL, defaultHeaders);
  }
}
