import nodemailer from "nodemailer";

export default async ({ to, subject, html, user, attachments }: any) => {
  let fromPass: string = "";

  if (user.email.includes("audrius")) {
    fromPass = process.env.NODEMAILER_PASS_AUDRIUS!;
  } else if (user.email.includes("andrius")) {
    fromPass = process.env.NODEMAILER_PASS_ANDRIUS!;
  } else if (user.email.includes("pardavimai")) {
    fromPass = process.env.NODEMAILER_PASS_HARIS!;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: user.email,
      pass: fromPass,
    },
  });

  try {
    await transporter.sendMail({
      from: "Moderni Tvora " + user.email,
      to,
      subject: subject,
      html,
      attachments,
    });
    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Error: " + error.message,
    };
  }
};
