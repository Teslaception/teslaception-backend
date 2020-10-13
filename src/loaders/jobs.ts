import Agenda from 'agenda';

import config from '../config';
import CarDataChecker from '../jobs/carDataChecker';
import EmailSequenceJob from '../jobs/emailSequence';

export default async ({ agenda }: { agenda: Agenda }): Promise<void> => {
  agenda.define(
    'send-email',
    { priority: 'high', concurrency: config.agenda.concurrency },
    // @TODO Could this be a static method? Would it be better?
    new EmailSequenceJob().handler,
  );

  agenda.define(
    'pull-sleeping-info',
    { priority: 'low', concurrency: config.agenda.concurrency },
    CarDataChecker.pullSleepingCarsInfo,
  );

  await agenda.start();

  await agenda.every('1 minute', 'pull-sleeping-info');
};
