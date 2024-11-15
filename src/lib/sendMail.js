"use server";

import EmailTemplate from "@/components/custom/emailTemplate";
const { Resend } = require("resend");

export async function sendEmailReq(names, amount) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  try {
    const { data, error } = await resend.emails.send({
      from: `${names} <samba@sambaotavise.com>`,
      to: ["akalegodlove@gmail.com"],
      subject: "New Order",
      react: EmailTemplate({ amount: amount, firstName: names }), 
    });

    console.log(data, " sent email");

    if (error) {
      console.log("resend error", error);
      return { error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { error: error.message };
  }
}
