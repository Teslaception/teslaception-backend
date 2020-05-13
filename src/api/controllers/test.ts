import { Controller, Get } from "routing-controllers";

@Controller("/test")
export class TestController {
  @Get("/")
  get() {
    return "Yeah that works";
  }
}
