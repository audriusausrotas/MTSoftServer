import nodemailer from "nodemailer";

export default async ({ to, subject, html, user, attachments }: any) => {
  let fromPass: string = process.env.NODEMAILER_PASS_AUDRIUS!;
  let email: string = "audrius@modernitvora.lt";

  if (user.email.includes("audrius")) {
    fromPass = process.env.NODEMAILER_PASS_AUDRIUS!;
    email = user.email;
  } else if (user.email.includes("andrius")) {
    fromPass = process.env.NODEMAILER_PASS_ANDRIUS!;
    email = user.email;
  } else if (user.email.includes("pardavimai")) {
    fromPass = process.env.NODEMAILER_PASS_HARIS!;
    email = user.email;
  } else if (user.email.includes("sandelys")) {
    fromPass = process.env.NODEMAILER_PASS_SANDELYS!;
    email = user.email;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: email,
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
