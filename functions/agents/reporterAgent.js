
import * as functions from "firebase-functions";
import fetch from "node-fetch";
import sgMail from "@sendgrid/mail";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const TO_EMAIL = process.env.TO_EMAIL;
const FROM_EMAIL = process.env.FROM_EMAIL;

sgMail.setApiKey(SENDGRID_API_KEY);

export const reporterAgent = functions.pubsub.schedule("every 6 hours").onRun(async (context) => {
  const report = `This is the hourly report.`;

  // Send to Slack
  if (SLACK_WEBHOOK_URL) {
    try {
      await fetch(SLACK_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: report }),
      });
      console.log("Successfully sent report to Slack");
    } catch (error) {
      console.error("Error sending report to Slack:", error);
    }
  }

  // Send email
  if (TO_EMAIL && FROM_EMAIL) {
    const msg = {
      to: TO_EMAIL,
      from: FROM_EMAIL,
      subject: "Hourly Report",
      text: report,
      html: `<strong>${report}</strong>`,
    };
    try {
      await sgMail.send(msg);
      console.log("Successfully sent report email");
    } catch (error) {
      console.error("Error sending report email:", error);
    }
  }
});
