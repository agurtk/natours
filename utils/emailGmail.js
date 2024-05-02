const nodemailer = require("nodemailer");

const sendGmail = async (options) => {
  // 1      create a trasporter // a service that send the email
  const trasporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.GMAIL_USERNAME,
      password: process.env.GMAIL_PASSWORD,
    },
    // Active in gmail "less secure app" option
  });

  // 2      define the email options
  const mailOptions = {
    from: "RavTech <qk8y3@example.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };
  // 3      actually send the email
  await trasporter.sendMail(mailOptions);
};

module.exports = sendGmail;
