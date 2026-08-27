import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  createUpcomingProject,
  findAreasByPlace,
  findBuildingById,
  findPlaceArea,
  findPlaces,
  findUpcomingProjects,
   deleteUpcomingProject,
  updateUpcomingProject,
} from "../repositories/upcomingProject.repository";

function cleanText(
  value: unknown
) {
  return String(
    value ?? ""
  ).trim();
}

export async function getPlaces(
  _req: Request,
  res: Response
) {
  try {
    const places =
      await findPlaces();

    return res.json({
      success: true,
      data: places,
    });
  } catch (error) {
    console.error(
      "Get places failed:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          "Unable to load places.",
      });
  }
}

export async function getAreas(
  req: Request,
  res: Response
) {
  try {
    const placeId =
      cleanText(
        req.query.placeId
      );

    if (!placeId) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Place is required.",
        });
    }

    const areas =
      await findAreasByPlace(
        placeId
      );

    return res.json({
      success: true,
      data: areas,
    });
  } catch (error) {
    console.error(
      "Get areas failed:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          "Unable to load areas.",
      });
  }
}

export async function getUpcomingProjects(
  _req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projects =
      await findUpcomingProjects();

    return res.json({
      success: true,
      data: projects,
    });
  } catch (error) {
    console.error(
      "Get upcoming projects failed:",
      error
    );

    next(error);
  }
}

export async function addUpcomingProject(
  req: Request,
  res: Response
) {
  try {
    const buildId =
      cleanText(
        req.body.buildId
      );

    const buildingName =
      cleanText(
        req.body.buildingName
      );

    const placeId =
      cleanText(
        req.body.placeId
      );

    const areaId =
      cleanText(
        req.body.areaId
      );

    const buildAreaText =
      cleanText(
        req.body.buildArea
      );

    if (!buildId) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Building ID is required.",
        });
    }

    if (!buildingName) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Building name is required.",
        });
    }

    if (!placeId) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Place is required.",
        });
    }

    if (!areaId) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Area is required.",
        });
    }

    if (
      buildId.length > 7
    ) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Building ID cannot exceed 7 characters.",
        });
    }

    let buildArea:
      number | null =
      null;

    if (buildAreaText) {
      buildArea =
        Number(
          buildAreaText
        );

      if (
        !Number.isFinite(
          buildArea
        ) ||
        buildArea <= 0
      ) {
        return res
          .status(400)
          .json({
            success: false,
            error:
              "Sq.Ft. must be a valid number.",
          });
      }
    }

    const existing =
      await findBuildingById(
        buildId
      );

    if (existing) {
      return res
        .status(409)
        .json({
          success: false,
          error:
            "Building ID already exists.",
        });
    }

    const placeArea =
      await findPlaceArea(
        placeId,
        areaId
      );

    if (!placeArea) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Selected area does not belong to the selected place.",
        });
    }

    const project =
      await createUpcomingProject(
        {
          buildId,
          buildingName,
          placeId,
          areaId,
          buildArea,
        },
        placeArea.countryId
      );

    return res
      .status(201)
      .json({
        success: true,
        message:
          "Upcoming project created successfully.",
        data:
          project,
      });
  } catch (error: any) {
    console.error(
      "Create upcoming project failed:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          error?.message ||
          "Unable to create upcoming project.",
      });
  }
}

export async function editUpcomingProject(
  req: Request,
  res: Response
) {
  try {
    const buildId =
      String(req.params.id || "").trim();

    const buildingName =
      String(
        req.body.buildingName || ""
      ).trim();

    const placeId =
      String(
        req.body.placeId || ""
      ).trim();

    const areaId =
      String(
        req.body.areaId || ""
      ).trim();

    const buildArea =
      req.body.buildArea === null ||
      req.body.buildArea === ""
        ? null
        : Number(req.body.buildArea);

    if (!buildId) {
      return res.status(400).json({
        success: false,
        error: "Building ID is required.",
      });
    }

    if (!buildingName) {
      return res.status(400).json({
        success: false,
        error: "Building name is required.",
      });
    }

    if (!placeId) {
      return res.status(400).json({
        success: false,
        error: "Place is required.",
      });
    }

    if (!areaId) {
      return res.status(400).json({
        success: false,
        error: "Area is required.",
      });
    }

    if (
      buildArea !== null &&
      (
        !Number.isFinite(buildArea) ||
        buildArea <= 0
      )
    ) {
      return res.status(400).json({
        success: false,
        error: "Sq.Ft. must be valid.",
      });
    }

    const placeArea =
      await findPlaceArea(
        placeId,
        areaId
      );

    if (!placeArea) {
      return res.status(400).json({
        success: false,
        error:
          "Selected area does not belong to the selected place.",
      });
    }

    await updateUpcomingProject(
      buildId,
      {
        buildingName,
        placeId,
        areaId,
        buildArea,
      }
    );

    return res.json({
      success: true,
      message:
        "Upcoming building updated successfully.",
    });
  } catch (error: any) {
    console.error(
      "Update upcoming building failed:",
      error
    );

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Unable to update upcoming building.",
    });
  }
}


export async function removeUpcomingProject(
  req: Request,
  res: Response
) {
  try {
    const buildId =
      String(
        req.params.id || ""
      ).trim();

    if (!buildId) {
      return res
        .status(400)
        .json({
          success: false,
          error:
            "Building ID is required.",
        });
    }

    await deleteUpcomingProject(
      buildId
    );

    return res.json({
      success: true,
      message:
        "Upcoming building removed successfully.",
    });
  } catch (error: any) {
    console.error(
      "Remove upcoming building failed:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,
        error:
          error?.message ||
          "Unable to remove upcoming building.",
      });
  }
}