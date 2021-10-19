import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: "bychance.official.dev@gmail.com",
    pass: process.env.MAILPASS,
  },
});

export const sendMail = async ({
  address,
  text,
}: {
  address: string;
  text: string;
}) => {
  await transporter.sendMail({
    from: "bychance.official.dev@gmail.com",
    to: address,
    text: text,
  });
};
