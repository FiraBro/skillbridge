// apps/api/src/modules/services/email.service.js
import { Resend } from "resend";
const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = "Skillbridge <jemailfiragos@gmail.com>";

export const sendResetEmail = async (to, name, link) => {
  return await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: "Reset your password",
    html: `<p>Hi ${name}, click <a href="${link}">here</a> to reset your password.</p>`,
  });
};

export const sendProfileViewEmail = async (to, devName, companyName) => {
  return await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: "Someone viewed your profile on SkillBridge!",
    html: `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Hi ${devName},</h2>
        <p><strong>${companyName}</strong> just viewed your profile!</p>
        <p>Your reputation and skills are getting noticed. Make sure your profile is up to date to increase your chances of being contacted.</p>
        <hr />
        <p style="font-size: 12px; color: #666;">View your dashboard to see more details.</p>
      </div>
    `,
  });
};

export const sendContactRequestEmail = async (
  to,
  receiverName,
  senderName,
  message,
) => {
  return await resend.emails.send({
    from: FROM_EMAIL,
    to: [to],
    subject: `New contact request from ${senderName}`,
    html: `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2>Hi ${receiverName},</h2>
        <p><strong>${senderName}</strong> wants to connect with you regarding a potential opportunity.</p>
        <blockquote style="border-left: 4px solid #ddd; padding-left: 10px; color: #555;">
          "${message}"
        </blockquote>
        <p>Log in to SkillBridge to accept or ignore this request.</p>
        <hr />
        <p style="font-size: 12px; color: #666;">Always research companies before sharing sensitive information.</p>
      </div>
    `,
  });
};
