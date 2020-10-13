import { Container } from 'typedi';

export default class CarDataChecker {
  public static async pullSleepingCarsInfo(job): Promise<void> {
    const Logger: Loggers.Logger = Container.get('logger');
    try {
      Logger.debug('✌️ pullSleepingCarsInfo Job triggered!');
    } catch (e) {
      Logger.error('🔥 Error with Email Sequence Job: %o', e);
    }
  }
}
