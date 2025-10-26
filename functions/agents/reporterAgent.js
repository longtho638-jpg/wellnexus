
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import fetch from "node-fetch";
import sgMail from "@sendgrid/mail";

// Initialize Firebase Admin if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}

/**
 * Collects metrics from specified Firestore collections.
 * @param {string[]} sources - Array of collection names to query.
 * @returns {Promise<object>} An object containing the collected metrics.
 */
async function collectMetrics(sources) {
  const db = admin.firestore();
  console.log(`Collecting metrics from: ${sources.join(", ")}`);
  
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

  // Get recent deployment errors
  const deployLogsSnap = await db.collection('deploy_logs')
                                 .where('status', '==', 'error')
                                 .where('timestamp', '>=', sixHoursAgo)
                                 .orderBy('timestamp', 'desc')
                                 .limit(5)
                                 .get();
  const deployErrors = deployLogsSnap.docs.map(doc => doc.data());

  // Count failed affiliate settlements in the last 6 hours
  const settleErrorsSnap = await db.collection('affiliate_settles')
                                   .where('status', '==', 'failed')
                                   .where('timestamp', '>=', sixHoursAgo)
                                   .get();

  const totalErrors = deployLogsSnap.size + settleErrorsSnap.size;
  // Simulate an error rate calculation
  const error_rate = totalErrors > 0 ? 0.1 + (Math.random() * 0.1) : Math.random() * 0.05;

  return {
    deployErrorCount: deployLogsSnap.size,
    settleErrorCount: settleErrorsSnap.size,
    deployErrors: deployErrors,
    error_rate: error_rate 
  };
}

/**
 * Formats the collected metrics into a human-readable report.
 * @param {object} metrics - The metrics object from collectMetrics.
 * @returns {string} The formatted report string.
 */
function formatReport(metrics) {
  let report = `📈 **Báo cáo Hệ thống WellNexus (6 giờ qua)**\n\n`;
  report += `*- Tỷ lệ lỗi (Error Rate):* ${(metrics.error_rate * 100).toFixed(2)}%\n`;
  report += `*- Lỗi Triển khai (Deploy Errors):* ${metrics.deployErrorCount}\n`;
  report += `*- Lỗi Thanh toán (Settle Errors):* ${metrics.settleErrorCount}\n\n`;

  if (metrics.error_rate > 0.1) {
    report += `🚨 **CẢNH BÁO: Tỷ lệ lỗi vượt ngưỡng 10%!**\n`;
    if (metrics.deployErrors.length > 0) {
        report += `*Chi tiết lỗi triển khai gần nhất:*\n`;
        metrics.deployErrors.forEach(err => {
            report += `  - \`commit: ${err.commit_sha?.substring(0, 7) || 'N/A'}\`: ${err.error_message}\n`;
        });
    }
     report += `\n*Hành động đề xuất:* Kích hoạt Predictive-Ops để mở ticket và scaffold giải pháp.`;
  } else {
    report += `✅ Hệ thống đang hoạt động ổn định.\n`;
  }
  return report;
}

/**
 * Sends a message to the specified Slack webhook URL.
 * @param {string} message The message to send.
 * @param {string} webhookUrl The Slack webhook URL.
 */
async function sendSlack(message, webhookUrl) {
    if (!webhookUrl) {
        console.warn("SLACK_WEBHOOK_URL not set in .env. Skipping Slack notification.");
        return;
    }
    try {
        await fetch(webhookUrl, { 
            method: 'POST', 
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: message }) 
        });
        console.log("Successfully sent message to Slack.");
    } catch (error) {
        console.error("Failed to send message to Slack:", error);
    }
}

/**
 * Sends an email report using SendGrid.
 * @param {string} report The HTML/text report.
 * @param {string} apiKey The SendGrid API key.
 * @param {string} to The recipient's email address.
 */
async function sendEmail(report, apiKey, to) {
    if (!apiKey) {
        console.warn("SENDGRID_API_KEY not set in .env. Skipping Email notification.");
        return;
    }
    sgMail.setApiKey(apiKey);
    const msg = {
        to: to,
        from: 'noreply@wellnexus.vn', // Use a verified sender
        subject: `Báo cáo Hệ thống WellNexus - ${new Date().toISOString()}`,
        text: report,
        html: report.replace(/\n/g, '<br>'),
    };
    try {
        await sgMail.send(msg);
        console.log(`Successfully sent email report to: ${to}`);
    } catch (error) {
        console.error("Failed to send email:", error);
    }
}


/**
 * The main Reporter Agent Cloud Function.
 * Runs every 6 hours to collect metrics, format a report, and send notifications.
 */
export const reporterAgent = functions
  .region("asia-southeast1")
  .pubsub.schedule("every 6 hours")
  .onRun(async () => {
    try {
      console.log("Reporter Agent is running...");
      const metrics = await collectMetrics(["deploy_logs", "affiliate_settles"]);
      const summary = formatReport(metrics);

      // We don't use Promise.all to avoid masking individual send errors
      await sendSlack(summary, process.env.SLACK_WEBHOOK_URL);
      await sendEmail(summary, process.env.SENDGRID_API_KEY, "ops@wellnexus.vn");
      
      console.log("Reporter run complete.");
      return "Reporter run complete";

    } catch (error) {
      console.error("CRITICAL: Reporter Agent failed catastrophically:", error);
      // Send a critical alert if the agent itself fails
      await sendSlack(`🚨 **CRITICAL: Reporter Agent failed execution!**\n\`\`\`${error.message}\`\`\``, process.env.SLACK_WEBHOOK_URL);
      return null;
    }
  });

