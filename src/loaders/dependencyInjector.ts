import { MailService } from '@sendgrid/mail';
import { Db } from 'mongodb';
import { Container } from 'typedi';

import config from '../config';
import agendaFactory from './agenda';
import LoggerInstance from './logger';

export default ({ mongoConnection }: { mongoConnection: Db }) => {
  try {
    const agendaInstance = agendaFactory({ mongoConnection });

    Container.set('agendaInstance', agendaInstance);
    Container.set('logger', LoggerInstance);
    const emailClient = new MailService();
    emailClient.setApiKey(config.emails.apiKey);

    Container.set('emailClient', emailClient);

    LoggerInstance.info('✌️ Agenda injected into container');

    return { agenda: agendaInstance };
  } catch (e) {
    LoggerInstance.error('🔥 Error on dependency injector loader: %o', e);
    throw e;
  }
};
