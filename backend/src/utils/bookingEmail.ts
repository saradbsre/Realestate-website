import nodemailer from "nodemailer";

interface BookingEmailData {
  bookingId: number;

  propertyId: string;
  propertyName: string;

  unitReference?: string | null;
  unitType?: string | null;

  customerName: string;
  email: string;
  phone: string;
  nationality: string;

  autoRejected: boolean;

  passportBuffer: Buffer;
  passportFilename: string;
  passportMimeType: string;
}

const smtpPort =
  Number(
    process.env.SMTP_PORT || 587
  );
export const mailTransporter =
  nodemailer.createTransport({
    host:
      process.env.SMTP_HOST,

    port: 587,

    secure: false, // true for 465, false for other ports

    // requireTLS: true,

    auth: {
      user:
        process.env.SMTP_USER,

      pass:
        process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

function escapeHtml(
  value: string
) {
  return value.replace(
    /[&<>'"]/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[char] || char
  );
}

export async function sendBookingEmails(
  data: BookingEmailData
) {
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER;

  const adminEmail =
    process.env.BOOKING_ADMIN_EMAIL;

  if (
    !from ||
    !adminEmail
  ) {
    throw new Error(
      "Booking email configuration is missing."
    );
  }

  const safe = {
    propertyName:
      escapeHtml(
        data.propertyName
      ),

    propertyId:
      escapeHtml(
        data.propertyId
      ),

    unitReference:
      escapeHtml(
        data.unitReference ||
          "-"
      ),

    unitType:
      escapeHtml(
        data.unitType ||
          "-"
      ),

    customerName:
      escapeHtml(
        data.customerName
      ),

    email:
      escapeHtml(
        data.email
      ),

    phone:
      escapeHtml(
        data.phone
      ),

    nationality:
      escapeHtml(
        data.nationality
      ),
  };

  /* =====================================================
     COMMON EMAIL TEMPLATE
  ===================================================== */

  const emailShell = (
    title: string,
    body: string
  ) => `
    <!doctype html>

    <html>
      <body
        style="
          margin:0;
          padding:0;
          background:#eef3f8;
          font-family:Arial,sans-serif;
          color:#1e293b;
        "
      >

        <table
          width="100%"
          cellspacing="0"
          cellpadding="0"
          border="0"
          style="
            padding:32px 12px;
            background:#eef3f8;
          "
        >
          <tr>
            <td align="center">

              <table
                width="680"
                cellspacing="0"
                cellpadding="0"
                border="0"
                style="
                  width:100%;
                  max-width:680px;
                  background:#ffffff;
                  border:1px solid #dbe5ef;
                  border-radius:16px;
                  overflow:hidden;
                "
              >

                <!-- HEADER -->

                <tr>
                  <td
                    align="center"
                    style="
                      padding:15px;
                      border-bottom:3px solid #f58220;
                    "
                  >
                    <strong
                      style="
                        color:#0b1a30;
                        font-size:17px;
                      "
                    >
                      ABDULWAHED BIN SHABIB REAL ESTATE
                    </strong>
                  </td>
                </tr>

                <!-- CONTENT -->

                <tr>
                  <td
                    style="
                      padding:20px 45px;
                    "
                  >
                    <h1
                      style="
                        margin:0 0 18px;
                        color:#0b1a30;
                        font-size:16px;
                      "
                    >
                      ${title}
                    </h1>

                    ${body}

                  </td>
                </tr>

                <!-- FOOTER -->

                <tr>
                  <td
                    style="
                      background:#fafafa;
                      border-top:1px solid #f1f5f9;
                      padding:26px;
                      text-align:center;
                      font-size:12px;
                      line-height:1.7;
                      color:#64748b;
                    "
                  >
                    <strong>
                      ABDULWAHED BIN SHABIB REAL ESTATE L.L.C
                    </strong>

                    <br />

                    Street # 44A - Hor Al Anz - Deira - Dubai, UAE

                    <br />

                    Tollfree: 800 22773
                    &nbsp; | &nbsp;
                    Landline: 04 329 8000
                  </td>
                </tr>

              </table>

            </td>
          </tr>
        </table>

      </body>
    </html>
  `;

  /* =====================================================
     BOOKING DETAILS
  ===================================================== */

  const detailsCard = `
    <table
      width="100%"
      cellspacing="0"
      cellpadding="0"
      border="0"
      style="
        margin:24px 0;
        background:#f8fafc;
        border:1px solid #dbe5ef;
        border-left:4px solid #0f4c81;
        border-radius:10px;
      "
    >
      <tr>
        <td
          style="
            padding:20px;
            font-size:14px;
            line-height:1.8;
            color:#334155;
          "
        >

          <strong
            style="
              color:#0b1a30;
            "
          >
            BOOKING DETAILS
          </strong>

          <p>
            <strong>
              Property:
            </strong>

            ${safe.propertyName}
          </p>

          
         ${
  data.unitType
    ? `
      <p>
        <strong>
          Unit Type:
        </strong>

        ${safe.unitType}
      </p>
    `
    : ""
}

          <p>
            <strong>
              Applicant:
            </strong>

            ${safe.customerName}
          </p>

          <p>
            <strong>
              Email:
            </strong>

            ${safe.email}
          </p>

          <p>
            <strong>
              Phone:
            </strong>

            ${safe.phone}
          </p>

          <p>
            <strong>
              Nationality:
            </strong>

            ${safe.nationality}
          </p>

         

        </td>
      </tr>
    </table>
  `;

  /* =====================================================
     ADMIN EMAIL
  ===================================================== */

  const adminStatus =
    data.autoRejected
      ? `
        <div
          style="
            background:#fff7ed;
            border:1px solid #fed7aa;
            border-radius:8px;
            padding:14px 16px;
            margin-bottom:20px;
            color:#9a3412;
          "
        >
          <strong>
            Auto Rejected
          </strong>

          <br />

          This booking was automatically declined
          based on the configured nationality rule.
        </div>
      `
      : `
        <div
          style="
            background:#eff6ff;
            border:1px solid #bfdbfe;
            border-radius:8px;
            padding:14px 16px;
            margin-bottom:20px;
            color:#1e40af;
          "
        >
          <strong>
            New Booking Request
          </strong>

          <br />

          A customer has submitted a booking request.
          Please review the booking details.
        </div>
      `;

  const adminBody = `
    ${adminStatus}

    ${detailsCard}
  `;

  /* =====================================================
     CUSTOMER EMAIL
  ===================================================== */

  const normalCustomerBody = `
    <p
      style="
        font-size:15px;
        line-height:1.7;
        color:#475569;
      "
    >
      Dear
      <strong>
        ${safe.customerName}
      </strong>,
    </p>

    <p
      style="
        font-size:15px;
        line-height:1.7;
        color:#475569;
      "
    >
      Thank you for your interest in
      <strong>
        ${safe.propertyName}
      </strong>.
    </p>

    <p
      style="
        font-size:15px;
        line-height:1.7;
        color:#475569;
      "
    >
      We have received your booking form.
      Our leasing coordinators will contact
      you shortly.
    </p>

    ${detailsCard}
  `;

  /* =====================================================
     AUTO-REJECT CUSTOMER DESIGN
  ===================================================== */

  const autoRejectCustomerBody = `
    <p
      style="
        font-size:15px;
        line-height:1.7;
        color:#475569;
      "
    >
      Dear
      <strong>
        ${safe.customerName}
      </strong>,
    </p>

    <p
      style="
        font-size:15px;
        line-height:1.7;
        color:#475569;
      "
    >
      Thank you for your interest in
      <strong>
        ${safe.propertyName}
      </strong>.
    </p>

    <div
      style="
        margin:24px 0;
        padding:20px;
        background:#fff7ed;
        border:1px solid #fed7aa;
        border-left:4px solid #f58220;
        border-radius:10px;
      "
    >
      <strong
        style="
          display:block;
          color:#0b1a30;
          font-size:16px;
          margin-bottom:8px;
        "
      >
        Booking Availability Update
      </strong>

      <span
        style="
          color:#475569;
          font-size:15px;
          line-height:1.7;
        "
      >
        We are sorry, but this unit was
        reserved very recently and is
        no longer available.
      </span>
    </div>

    <p
      style="
        font-size:15px;
        line-height:1.7;
        color:#475569;
      "
    >
      We appreciate your interest and
      would be happy to assist you with
      other available properties.
    </p>

    ${detailsCard}
  `;

  /* =====================================================
     SEND MAIL
  ===================================================== */

  const adminMail =
    mailTransporter.sendMail({
      from,

      to:
        adminEmail,

      replyTo:
        data.email,

      subject:
        data.autoRejected
          ? `Auto Rejected Booking #${data.bookingId} - ${data.propertyName}`
          : `New Booking #${data.bookingId} - ${data.propertyName}`,

      html:
        emailShell(
          data.autoRejected
            ? "Auto-Rejected Booking Request"
            : "New Booking Request",

          adminBody
        ),

      attachments: [
        {
          filename:
            data.passportFilename,

          content:
            data.passportBuffer,

          contentType:
            data.passportMimeType,
        },
      ],
    });

  const customerMail =
    mailTransporter.sendMail({
      from,

      to:
        data.email,

      subject:
        data.autoRejected
          ? `Booking Availability Update - ${data.propertyName}`
          : `Booking Form Received - ${data.propertyName}`,

      html:
        emailShell(
          data.autoRejected
            ? "Booking Availability Update"
            : `Thank You, ${safe.customerName}`,

          data.autoRejected
            ? autoRejectCustomerBody
            : normalCustomerBody
        ),
    });

  await Promise.all([
    adminMail,
    customerMail,
  ]);
}