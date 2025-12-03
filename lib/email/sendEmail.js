import Mailjet from "node-mailjet";

const MAIL_API_TOKEN = process?.env?.MAIL_API_TOKEN;
const MAIL_SECRET_TOKEN = process?.env?.MAIL_SECRET_TOKEN;

let mailjet = null;
if (MAIL_API_TOKEN && MAIL_SECRET_TOKEN) {
  mailjet = new Mailjet({ apiKey: MAIL_API_TOKEN, apiSecret: MAIL_SECRET_TOKEN });
} else {
  // avoid throwing when credentials are not provided — email sending will be disabled
  // This keeps existing behavior safe in environments without Mailjet configured.
  // eslint-disable-next-line no-console
  console.warn("Mailjet credentials not set — email sending is disabled");
}

/**
 * @param {Array} recipientEmails array of objects
 * @example
  recipientEmails: [{
    Email: "email@mail.com",
    Name: "name" //optional
}]
 * @param {String} subject
 * @param {String} body
*/
async function sendEmail(recipientEmails = [], subject = "", body) {
  try {
    if (!mailjet) {
      // Mail sending is disabled in this environment. Log details and return silently.
      // eslint-disable-next-line no-console
      console.info("Email disabled — skipping send. Recipients:", recipientEmails, "Subject:", subject);
      return { status: "disabled" };
    }

    // perform actual send when mailjet is available
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAIL_SENDER_EMAIL,
            Name: "Destiine Travel Agency",
          },
          To: recipientEmails,
          Subject: subject,
          HTMLPart: body,
        },
      ],
    });
  } catch (error) {
    console.log(error);
    throw error;
  }
}

export default sendEmail;
