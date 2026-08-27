import type {
  Request,
  Response,
} from "express";

import {
  findNationalities,
  disableNationalityAutoReject,
  enableNationalityAutoReject,
  findAutoRejectNationalities,
  findAvailableNationalities,
} from "../repositories/nationality.repository";

export async function getNationalities(
  _req: Request,
  res: Response
) {
  try {
    const nationalities =
      await findNationalities();

    return res.json({
      success: true,
      data: nationalities,
    });
  } catch (error) {
    console.error(
      "Unable to load nationalities:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          "Unable to load nationalities.",
      });
  }
}
export async function getAutoRejectNationalities(
  _req: Request,
  res: Response
) {
  try {
    const data =
      await findAutoRejectNationalities();

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "Auto reject nationality load failed:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Unable to load auto reject nationalities.",
    });
  }
}

export async function getAvailableNationalities(
  _req: Request,
  res: Response
) {
  try {
    const data =
      await findAvailableNationalities();

    return res.json({
      success: true,
      data,
    });
  } catch (error: any) {
    console.error(
      "Available nationality load failed:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Unable to load nationalities.",
    });
  }
}

export async function addAutoRejectNationality(
  req: Request,
  res: Response
) {
  try {
    const nationId =
      String(
        req.body.nationId ||
          ""
      ).trim();

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
            "Invalid nationality ID.",
        });
    }

    const affected =
      await enableNationalityAutoReject(
        nationId
      );

    if (
      affected === 0
    ) {
      return res
        .status(404)
        .json({
          success: false,
          error:
            "Nationality not found or already configured for auto rejection.",
        });
    }

    return res.json({
      success: true,
      message:
        "Nationality added to auto rejection.",
    });
  } catch (error: any) {
    console.error(
      "Add auto reject nationality failed:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          error?.message ||
          "Unable to add nationality.",
      });
  }
}
export async function removeAutoRejectNationality(
  req: Request,
  res: Response
) {
  try {
    const nationId =
      String(
        req.params.id ||
          ""
      ).trim();

    if (!nationId) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Nationality ID is required.",
        });
    }

    if (nationId.length > 7) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Invalid nationality ID.",
        });
    }

    const affected =
      await disableNationalityAutoReject(
        nationId
      );

    if (
      affected === 0
    ) {
      return res
        .status(404)
        .json({
          success: false,
          error:
            "Nationality not found or is not configured for auto rejection.",
        });
    }

    return res.json({
      success: true,
      message:
        "Nationality removed from auto rejection.",
    });
  } catch (error: any) {
    console.error(
      "Remove auto reject nationality failed:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          error?.message ||
          "Unable to remove nationality.",
      });
  }
}
