import { MailService } from '@sendgrid/mail';
import { Inject, Service } from 'typedi';

import { IUser } from '../interfaces/IUser';

@Service()
export default class MailerService {
  constructor(@Inject('emailClient') private emailClient: MailService) {}

  public async SendWelcomeEmail(emailAddress) {
    /**
     * @TODO Call Mailchimp/Sendgrid or whatever
     */
    // Added example for sending mail from mailgun

    // using Twilio SendGrid's v3 Node.js Library
    // https://github.com/sendgrid/sendgrid-nodejs

    const emailData = {
      from: 'corentin.leman.apps@gmail.com',
      to: emailAddress,
      subject: 'Welcome to Teslaception!',
      text: 'Testing some Mailgun awesomness!',
      html: '<strong>That Works!</strong>',
    };

    (async () => {
      try {
        await this.emailClient.send(emailData);
      } catch (error) {
        console.error(error);

        if (error.response) {
          console.error(error.response.body);
        }
      }
    })();
    return { delivered: 1, status: 'ok' };
  }

  public StartEmailSequence(_sequence: string, user: Partial<IUser>) {
    if (!user.email) {
      throw new Error('No email provided');
    }
    // @TODO Add example of an email sequence implementation
    // Something like
    // 1 - Send first email of the sequence
    // 2 - Save the step of the sequence in database
    // 3 - Schedule job for second email in 1-3 days or whatever
    // Every sequence can have its own behavior so maybe
    // the pattern Chain of Responsibility can help here.
    return { delivered: 1, status: 'ok' };
  }
}
