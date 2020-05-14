import Container from "typedi";
import HttpClientFactory from "../HttpClientFactory/HttpClientFactory";

export default () => {
  const httpClientFactory = new HttpClientFactory();

  Container.set(
    "teslaCarHttpClient",
    httpClientFactory.createRestClient(process.env.TESLA_URL)
  );
};
