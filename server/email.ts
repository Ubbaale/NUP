import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const FROM_EMAIL = process.env.FROM_EMAIL || "noreply@diasporanup.org";
const FROM_NAME = process.env.FROM_NAME || "NUP Diaspora";

let transporter: nodemailer.Transporter | null = null;

function getTransporter(): nodemailer.Transporter | null {
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) {
    return null;
  }
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }
  return transporter;
}

export function isEmailConfigured(): boolean {
  return !!(SMTP_HOST && SMTP_USER && SMTP_PASS);
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const transport = getTransporter();
  if (!transport) {
    console.log(`[Email] Not configured — would send to ${to}: "${subject}"`);
    return false;
  }
  try {
    await transport.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: "${subject}"`);
    return true;
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
    return false;
  }
}

export async function sendTicketConfirmation(params: {
  buyerEmail: string;
  buyerName: string;
  eventTitle: string;
  eventDate: string;
  ticketCode: string;
  ticketPrice: string;
  meetingLink?: string;
}): Promise<boolean> {
  const subject = `Your Ticket for ${params.eventTitle} — NUP Diaspora`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #b91c1c; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Ticket Confirmed</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">National Unity Platform — People Power</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #333;">Hello <strong>${params.buyerName}</strong>,</p>
        <p style="color: #555;">Your ticket for <strong>${params.eventTitle}</strong> has been confirmed.</p>
        
        <div style="background: #f8f8f8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Event</td><td style="padding: 8px 0; font-weight: bold;">${params.eventTitle}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Date</td><td style="padding: 8px 0;">${params.eventDate}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Amount</td><td style="padding: 8px 0;">$${params.ticketPrice}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Ticket Code</td><td style="padding: 8px 0; font-family: monospace; font-size: 18px; font-weight: bold; color: #b91c1c;">${params.ticketCode}</td></tr>
          </table>
        </div>

        ${params.meetingLink ? `
        <div style="background: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin: 24px 0;">
          <p style="margin: 0 0 8px; font-weight: bold; color: #92400e;">Meeting Link</p>
          <a href="${params.meetingLink}" style="color: #b91c1c; word-break: break-all;">${params.meetingLink}</a>
        </div>
        ` : ""}

        <p style="color: #555; font-size: 14px;">Please save your ticket code. You may need it to verify your attendance.</p>
        <p style="color: #555; font-size: 14px;">People Power! Our Power!</p>
      </div>
      <div style="background: #f3f4f6; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        NUP Diaspora — National Unity Platform<br>
        <a href="https://diasporanup.org" style="color: #b91c1c;">diasporanup.org</a>
      </div>
    </div>
  `;
  return sendEmail(params.buyerEmail, subject, html);
}

export async function sendDonationReceipt(params: {
  donorEmail: string;
  donorName: string;
  amount: string;
  campaignTitle?: string;
  donationDate: string;
}): Promise<boolean> {
  const purpose = params.campaignTitle || "General Donation";
  const subject = `Donation Receipt — Thank You! — NUP Diaspora`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #b91c1c; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Thank You!</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Your generosity powers the movement</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #333;">Dear <strong>${params.donorName}</strong>,</p>
        <p style="color: #555;">Thank you for your generous donation to the National Unity Platform Diaspora.</p>
        
        <div style="background: #f8f8f8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Purpose</td><td style="padding: 8px 0; font-weight: bold;">${purpose}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Amount</td><td style="padding: 8px 0; font-size: 24px; font-weight: bold; color: #b91c1c;">$${params.amount}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Date</td><td style="padding: 8px 0;">${params.donationDate}</td></tr>
          </table>
        </div>

        <p style="color: #555; font-size: 14px;">People Power! Our Power!</p>
      </div>
      <div style="background: #f3f4f6; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        NUP Diaspora — National Unity Platform<br>
        <a href="https://diasporanup.org" style="color: #b91c1c;">diasporanup.org</a>
      </div>
    </div>
  `;
  return sendEmail(params.donorEmail, subject, html);
}

export async function sendMembershipWelcome(params: {
  email: string;
  fullName: string;
  tierName: string;
  amount: string;
  interval: string;
  renewalDate: string;
  benefits: string[];
}): Promise<boolean> {
  const subject = `Welcome to NUP ${params.tierName} Membership — NUP Diaspora`;
  const benefitsList = params.benefits.map(b => `<li style="padding: 4px 0; color: #555;">${b}</li>`).join("");
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #b91c1c; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Welcome, ${params.tierName}!</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">You're now part of the movement</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #333;">Dear <strong>${params.fullName}</strong>,</p>
        <p style="color: #555;">Welcome to the <strong>${params.tierName}</strong> membership tier! Your support makes a real difference in Uganda's fight for democracy.</p>
        
        <div style="background: #f8f8f8; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Tier</td><td style="padding: 8px 0; font-weight: bold;">${params.tierName}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Amount</td><td style="padding: 8px 0;">$${params.amount}/${params.interval === "yearly" ? "year" : "month"}</td></tr>
            <tr><td style="padding: 8px 0; color: #888; font-size: 14px;">Next Renewal</td><td style="padding: 8px 0;">${params.renewalDate}</td></tr>
          </table>
        </div>

        <h3 style="color: #333; margin-bottom: 8px;">Your Benefits:</h3>
        <ul style="list-style-type: none; padding: 0; margin: 0 0 24px;">${benefitsList}</ul>

        <p style="color: #555; font-size: 14px;">People Power! Our Power!</p>
      </div>
      <div style="background: #f3f4f6; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        NUP Diaspora — National Unity Platform<br>
        <a href="https://diasporanup.org" style="color: #b91c1c;">diasporanup.org</a>
      </div>
    </div>
  `;
  return sendEmail(params.email, subject, html);
}

export async function sendNewsletter(params: {
  to: string;
  subject: string;
  content: string;
  unsubscribeId: string;
}): Promise<boolean> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #b91c1c; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">NUP Diaspora</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">National Unity Platform — People Power</p>
      </div>
      <div style="padding: 32px 24px;">
        ${params.content}
      </div>
      <div style="background: #f3f4f6; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        NUP Diaspora — National Unity Platform<br>
        <a href="https://diasporanup.org" style="color: #b91c1c;">diasporanup.org</a><br>
        <p style="margin-top: 8px; font-size: 11px;">You received this because you subscribed to our newsletter.</p>
      </div>
    </div>
  `;
  return sendEmail(params.to, params.subject, html);
}

export async function sendMemberRegistration(params: {
  email: string;
  fullName: string;
  membershipId: string;
}): Promise<boolean> {
  const subject = `NUP Membership Registration Confirmed — NUP Diaspora`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
      <div style="background: #b91c1c; color: white; padding: 24px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Registration Complete</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Welcome to the National Unity Platform</p>
      </div>
      <div style="padding: 32px 24px;">
        <p style="font-size: 16px; color: #333;">Dear <strong>${params.fullName}</strong>,</p>
        <p style="color: #555;">Your NUP Diaspora membership registration is now confirmed.</p>
        
        <div style="background: #f8f8f8; border-radius: 8px; padding: 20px; margin: 24px 0; text-align: center;">
          <p style="margin: 0 0 8px; color: #888; font-size: 14px;">Your Membership ID</p>
          <p style="margin: 0; font-family: monospace; font-size: 24px; font-weight: bold; color: #b91c1c;">${params.membershipId}</p>
        </div>

        <p style="color: #555; font-size: 14px;">Save this ID — you can use it to look up your membership status anytime on our website.</p>
        <p style="color: #555; font-size: 14px;">People Power! Our Power!</p>
      </div>
      <div style="background: #f3f4f6; padding: 16px 24px; text-align: center; font-size: 12px; color: #888;">
        NUP Diaspora — National Unity Platform<br>
        <a href="https://diasporanup.org" style="color: #b91c1c;">diasporanup.org</a>
      </div>
    </div>
  `;
  return sendEmail(params.email, subject, html);
}
