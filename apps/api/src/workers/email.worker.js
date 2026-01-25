import { Worker } from "bullmq";
import { sendResetEmail } from "../services/email.service.js";

const connection = { host: "localhost", port: 6379 }; // Your Redis config

const worker = new Worker(
  "email-tasks",
  async (job) => {
    if (job.name === "send-reset-email") {
      const { email, name, resetLink } = job.data;
      console.log(`Sending reset email to ${email}...`);

      // The actual slow network call happens here, away from the user
      await sendResetEmail(email, name, resetLink);
    }
  },
  { connection },
);

worker.on("failed", (job, err) => {
  console.error(`${job.id} failed: ${err.message}`);
});
