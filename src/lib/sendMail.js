
"use server";

import EmailTemplate from "@/components/custom/emailTemplate";
const { Resend } = require("resend");

  export async function sendEmailReq(email, names, messageC, subject) {
   
    const resend = new Resend(process.env.RESEND_API_KEY);
    try {
      const { data, error } = await resend.emails.send({
        from: `${names} <samba@sambaotavise.com>`,
        to: ["ething215@gmail.com"],
        subject: subject,
        react: EmailTemplate({ message: messageC, name: names, email: email }),
      });

      if (error) {
        return { error: error.message };
      }

      console.log(data, " sent email");

      return { success: true };
    } catch (error) {
      return { error: error.message };
    }
  }