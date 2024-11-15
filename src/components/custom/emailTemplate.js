
import { CURRENCY } from "@/lib/firebaseHooks";
import * as React from "react";



export const EmailTemplate = ({ amount, firstName }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <p className="text-2xl font-bold mb-4">
      New Order Received, {firstName} just placed an Order worth{" "}
      <strong>
        {CURRENCY?.sign}
        {amount}
      </strong>
      on your website!
    </p>
    <p className="text-gray-700 mb-4">
      We wanted to let you know that a new order has been placed on your
      website. Please click the button below to access your dashboard and
      process the order.
    </p>
    <div className="flex justify-center">
      <a
        href={"/admin/"}
        className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
      >
        View Dashboard
      </a>
    </div>
    <p className="text-gray-700 mt-4">
      If you have any questions or need assistance, don&apos;t hesitate to reach
      out to our support team.
    </p>
    <br />
    <br />
    <p className="text-gray-700 mt-4">
      Best regards,
      <br />
      The Team <br />
      KYNGKALE
    </p>
  </div>
);

export default EmailTemplate;
