import type {
  Request,
  Response,
} from "express";

import {
  createWebEnquiry,
  findEnquiryNationalityRule,
} from "../repositories/enquiry.repository";

/* =========================================================
   SUBMIT WEB ENQUIRY
========================================================= */

export async function submitEnquiry(
  req: Request,
  res: Response
) {
  try {
    const customerName =
      String(
        req.body.customerName ||
        req.body.name ||
        ""
      ).trim();

    const email =
      String(
        req.body.email ||
        ""
      ).trim();

    const phone =
      String(
        req.body.phone ||
        ""
      ).trim();

    const nationId =
      String(
        req.body.nationId  ||
        ""
      ).trim();

    const inquiryDepartment =
      String(
        req.body.inquiryDepartment ||
        ""
      ).trim() || null;

    const message =
      String(
        req.body.message ||
        ""
      ).trim();

    /* =====================================================
       VALIDATION
    ===================================================== */

    if (!customerName) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Full name is required.",
        });
    }

    if (!email) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Email address is required.",
        });
    }

    if (!phone) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Phone number is required.",
        });
    }

    if (!nationId) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Nationality is required.",
        });
    }

    if (nationId.length > 7) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid nationality.",
        });
    }

    if (!message) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Message is required.",
        });
    }

    /* =====================================================
       AUTO REJECT CHECK
    ===================================================== */

    const nationalityRule =
      await findEnquiryNationalityRule(
        nationId
      );

    const isAutoRejected =
      Boolean(
        nationalityRule
          ?.isAutoReject
      );

    /* =====================================================
       SAVE
    ===================================================== */

    const created =
      await createWebEnquiry(
        {
          customerName,
          email,
          phone,
          nationId,
          inquiryDepartment,
          message,
        },
        isAutoRejected
      );

    /*
     * Do not tell public user that
     * nationality auto rejection happened.
     */

    return res
      .status(201)
      .json({
        success: true,

        data: {
          id:
            created.id,
        },

        message:
          "Your enquiry has been submitted successfully.",
      });
  } catch (error) {
    console.error(
      "Submit enquiry failed:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        error:
          "Unable to submit enquiry. Please try again.",
      });
  }
}
