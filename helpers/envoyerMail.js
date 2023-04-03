'use strict';
const nodemailer = require("nodemailer");
const config = require(`../config/${process.env.NODE_ENV}.json`);


class EnvoyerMail {


 

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.mail.host,
      port: config.mail.port,
      secure: false,
      tls: {
        minVersion: 'TLSv1',
        rejectUnauthorized: false
      }
    });
  }

  envoyerMail(message) {
    let mailOptions = {
      from:config.mail.address,
      to: message.to,
      subject: message.subject,
      html: message.html,
      attachments: message.attachments
    };



    // send mail with defined transport object
    if (process.env.NODE_ENV !== 'development') {
      this.transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.log('Erreur email', err);
        } else {
          console.log('Mail envoyé', info.messageId);
        }
      });
    } else {
      console.log(`Mail non envoyé en mode development à ${message.to} : ${message.html}`);
    }

  }
}

const envoyerMail = new EnvoyerMail();

module.exports = envoyerMail;

