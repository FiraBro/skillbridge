// apps/api/src/services/email.service.js
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

export const sendResetEmail = async (to, name, link) => {
  return await resend.emails.send({
    from: "Skillbridge <noreply@skillbridge.com>",
    to: [to],
    subject: "Reset your password",
    html: `<p>Hi ${name}, click <a href="${link}">here</a> to reset your password.</p>`,
  });
};
