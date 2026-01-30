import { Worker } from "bullmq";
import {
  sendResetEmail,
  sendProfileViewEmail,
  sendContactRequestEmail,
  sendJobApplicationEmail,
  sendApplicationStatusEmail,
} from "../modules/services/email.service.js";

const connection = { host: "localhost", port: 6379 }; // Your Redis config

const worker = new Worker(
  "email-tasks",
  async (job) => {
    if (job.name === "send-reset-email") {
      const { email, name, resetLink } = job.data;
      await sendResetEmail(email, name, resetLink);
    } else if (job.name === "send-profile-view-notification") {
      const { to, devName, companyName } = job.data;
      await sendProfileViewEmail(to, devName, companyName);
    } else if (job.name === "send-contact-request-notification") {
      const { to, receiverName, senderName, message } = job.data;
      await sendContactRequestEmail(to, receiverName, senderName, message);
    } else if (job.name === "send-job-application-notification") {
      const { to, clientName, applicantName, jobTitle } = job.data;
      await sendJobApplicationEmail(to, clientName, applicantName, jobTitle);
    } else if (job.name === "send-application-status-notification") {
      const { to, applicantName, status, jobTitle, companyName } = job.data;
      await sendApplicationStatusEmail(
        to,
        applicantName,
        status,
        jobTitle,
        companyName,
      );
    }
  },
  { connection },
);

worker.on("failed", (job, err) => {
  console.error(`${job.id} failed: ${err.message}`);
});
