import {
  mailTransporter,
} from "../config/mailer";

interface SendBookingEmailInput {
  bookingId: number;

  propertyId: string;

  propertyName: string;

  customerName: string;

  email: string;

  phone: string;

  nationality: string;

  passportBuffer: Buffer;

  passportFilename: string;

  passportMimeType: string;
}

function escapeHtml(
  value: string
): string {
  return String(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
}

export async function sendBookingEmails(
  data: SendBookingEmailInput
) {
  const from =
    process.env.SMTP_FROM;

  const adminEmail =
    process.env
      .BOOKING_ADMIN_EMAIL;

  if (
    !from ||
    !adminEmail
  ) {
    console.warn(
      "SMTP_FROM or BOOKING_ADMIN_EMAIL is not configured."
    );

    return;
  }

  const safe = {
    propertyName:
      escapeHtml(
        data.propertyName
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

    propertyId:
      escapeHtml(
        data.propertyId
      ),
  };

  const bookingDetails = `
    <table
      cellpadding="0"
      cellspacing="0"
      width="100%"
      style="
        margin-top:20px;
        background:#f7f9fc;
        border:1px solid #dde6ef;
        border-radius:10px;
      "
    >
      <tr>
        <td
          style="
            padding:20px;
            font-family:Arial,sans-serif;
            font-size:14px;
            color:#31445a;
            line-height:1.7;
          "
        >
          <div>
            <strong>
              Booking Reference:
            </strong>

            #${data.bookingId}
          </div>

          <div>
            <strong>
              Property:
            </strong>

            ${safe.propertyName}
          </div>

          <div>
            <strong>
              Building ID:
            </strong>

            ${safe.propertyId}
          </div>

          <div>
            <strong>
              Customer:
            </strong>

            ${safe.customerName}
          </div>

          <div>
            <strong>
              Email:
            </strong>

            ${safe.email}
          </div>

          <div>
            <strong>
              Phone:
            </strong>

            ${safe.phone}
          </div>

          <div>
            <strong>
              Nationality:
            </strong>

            ${safe.nationality}
          </div>
        </td>
      </tr>
    </table>
  `;

  const adminHtml = `
    <!DOCTYPE html>

    <html>
      <body
        style="
          margin:0;
          background:#eef3f8;
          font-family:Arial,sans-serif;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
        >
          <tr>
            <td
              align="center"
              style="padding:30px 12px;"
            >
              <table
                width="650"
                cellpadding="0"
                cellspacing="0"
                style="
                  max-width:650px;
                  width:100%;
                  background:#ffffff;
                  border-radius:12px;
                  overflow:hidden;
                "
              >
                <tr>
                  <td
                    style="
                      padding:24px;
                      background:#0b568f;
                      color:#ffffff;
                    "
                  >
                    <h2
                      style="
                        margin:0;
                        font-size:20px;
                      "
                    >
                      New Property Booking
                    </h2>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:28px;
                    "
                  >
                    <p>
                      A new booking
                      request has been
                      submitted from the
                      website.
                    </p>

                    ${bookingDetails}

                    <p
                      style="
                        margin-top:20px;
                        color:#64748b;
                        font-size:12px;
                      "
                    >
                      The customer's
                      passport copy is
                      attached to this
                      email.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const customerHtml = `
    <!DOCTYPE html>

    <html>
      <body
        style="
          margin:0;
          background:#eef3f8;
          font-family:Arial,sans-serif;
        "
      >
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
        >
          <tr>
            <td
              align="center"
              style="padding:30px 12px;"
            >
              <table
                width="650"
                cellpadding="0"
                cellspacing="0"
                style="
                  max-width:650px;
                  width:100%;
                  background:#ffffff;
                  border-radius:12px;
                  overflow:hidden;
                "
              >
                <tr>
                  <td
                    style="
                      padding:24px;
                      background:#0b568f;
                      color:#ffffff;
                    "
                  >
                    <h2
                      style="
                        margin:0;
                        font-size:20px;
                      "
                    >
                      Booking Request Received
                    </h2>
                  </td>
                </tr>

                <tr>
                  <td
                    style="
                      padding:28px;
                    "
                  >
                    <p>
                      Dear
                      <strong>
                        ${safe.customerName}
                      </strong>,
                    </p>

                    <p>
                      Thank you for your
                      interest in
                      <strong>
                        ${safe.propertyName}
                      </strong>.
                    </p>

                    <p>
                      Your booking request
                      has been received.
                      Our leasing team
                      will review the
                      request and contact
                      you.
                    </p>

                    ${bookingDetails}

                    <p>
                      Regards,<br />
                      <strong>
                        Abdulwahed Bin
                        Shabib Real Estate
                      </strong>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  /*
  |--------------------------------------------------------------------------
  | Admin
  |--------------------------------------------------------------------------
  */

  const adminMail =
    mailTransporter.sendMail({
      from,

      to:
        adminEmail,

      replyTo:
        data.email,

      subject:
        `New Booking #${data.bookingId} - ${data.propertyName}`,

      html:
        adminHtml,

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

  /*
  |--------------------------------------------------------------------------
  | Customer
  |--------------------------------------------------------------------------
  |
  | Do NOT attach the passport again.
  |
  */

  const customerMail =
    mailTransporter.sendMail({
      from,

      to:
        data.email,

      subject:
        `Booking Request Received - ${data.propertyName}`,

      html:
        customerHtml,
    });

  await Promise.all([
    adminMail,
    customerMail,
  ]);
}