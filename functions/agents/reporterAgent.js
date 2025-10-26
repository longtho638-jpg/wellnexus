
const functions = require("firebase-functions");
const fetch = require("node-fetch");
const sgMail = require("@sendgrid/mail");

// Set API keys from environment variables
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

exports.reporterAgent = functions
  .region("asia-southeast1")
  .pubsub.schedule("every 6 hours")
  .onRun(async (context) => {
    console.log("ReporterAgent is running.");

    try {
      // 1. Gather data (replace with actual data fetching logic)
      const reportData = {
        timestamp: new Date().toISOString(),
        metrics: {
          totalSales: Math.floor(Math.random() * 1000),
          newAffiliates: Math.floor(Math.random() * 50),
          complianceIssues: Math.floor(Math.random() * 5),
        },
        errors: [], // Populate with actual errors if any
      };

      // 2. Format the report
      const reportTitle = `WellNexus Daily Report - ${new Date().toLocaleDateString("vi-VN")}`;
      const textReport = \`
*${reportTitle}*
---------------------
- Total Sales: \${reportData.metrics.totalSales}
- New Affiliates: \${reportData.metrics.newAffiliates}
- Compliance Issues: \${reportData.metrics.complianceIssues}
- Errors: \${reportData.errors.length > 0 ? reportData.errors.join(", ") : "None"}
\`;

      const htmlReport = \`
<h3>${reportTitle}</h3>
<ul>
  <li><strong>Total Sales:</strong> \${reportData.metrics.totalSales}</li>
  <li><strong>New Affiliates:</strong> \${reportData.metrics.newAffiliates}</li>
  <li><strong>Compliance Issues:</strong> \${reportData.metrics.complianceIssues}</li>
  <li><strong>Errors:</strong> \${reportData.errors.length > 0 ? reportData.errors.join(", ") : "None"}</li>
</ul>
\`;

      // 3. Send to Slack
      if (SLACK_WEBHOOK_URL) {
        await fetch(SLACK_WEBHOOK_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: textReport }),
        });
        console.log("Successfully sent report to Slack.");
      } else {
        console.warn("SLACK_WEBHOOK_URL not set. Skipping Slack notification.");
      }


      // 4. Send Email via SendGrid
      const mailTo = process.env.REPORT_EMAIL_TO;
      const mailFrom = process.env.REPORT_EMAIL_FROM;

      if (mailTo && mailFrom) {
          const msg = {
              to: mailTo,
              from: mailFrom,
              subject: reportTitle,
              text: textReport,
              html: htmlReport,
          };
          await sgMail.send(msg);
          console.log("Successfully sent report email.");
      } else {
          console.warn("REPORT_EMAIL_TO or REPORT_EMAIL_FROM not set. Skipping email notification.")
      }


      console.log("ReporterAgent finished successfully.");
      return null;

    } catch (error) {
      console.error("Error running reporterAgent:", error);
      return null;
    }
  });
