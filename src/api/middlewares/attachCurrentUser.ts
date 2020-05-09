import { Container } from "typedi";
import * as mongoose from "mongoose";
import { IUser } from "../../interfaces/IUser";

/**
 * Attach user to req.user
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const attachCurrentUser = async (req, res, next) => {
  const Logger: Loggers.Logger = Container.get("logger");
  try {
    const UserModel = Container.get("userModel") as mongoose.Model<
      IUser & mongoose.Document
    >; // TODO: Is that the right way of casting models?
    // TODO: Also should we make a service for the DB and use it here?
    const userRecord = await UserModel.findById(req.token._id);
    if (!userRecord) {
      return res.sendStatus(401);
    }
    const currentUser = userRecord.toObject();
    Reflect.deleteProperty(currentUser, "password");
    Reflect.deleteProperty(currentUser, "salt");
    req.currentUser = currentUser;
    return next();
  } catch (e) {
    Logger.error("🔥 Error attaching user to req: %o", e);
    return next(e);
  }
};

export default attachCurrentUser;
