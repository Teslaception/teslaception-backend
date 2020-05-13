import { Inject, Service } from "typedi";
import * as mongoose from "mongoose";
import { IUser } from "../../interfaces/IUser";
import { Action, UnauthorizedError } from "routing-controllers";

@Service()
export default class CurrentUserMiddleware {
  constructor(
    @Inject("logger") private logger: Loggers.Logger,
    @Inject("userModel")
    private UserModel: mongoose.Model<IUser & mongoose.Document> //check if I can do something like what's done in the other project: () => AuthConfig
  ) {}

  public async getCurrentUser(action: Action) {
    try {
      const userRecord = await this.UserModel.findById(
        action.request.token._id
      );
      if (!userRecord) {
        throw new UnauthorizedError("user not found");
      }
      const currentUser = userRecord.toObject();
      Reflect.deleteProperty(currentUser, "password");
      Reflect.deleteProperty(currentUser, "salt");
      return currentUser;
    } catch (error) {
      this.logger.error("🔥 Error attaching user to req: %o", error);
      throw new UnauthorizedError("invalid_token");
    }
  }
}
