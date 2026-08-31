import sql from "mssql";

import {
  getBinShabibEstateNet,
} from "../config/BinShabibEstate";


export interface SaveUnitImageInput {
  buildingId: string;

  unitDesc: string;

  imagePath: string;

  fileName:
    string | null;

  fileSize:
    number | null;

  displayOrder:
    number;

  isPrimary:
    boolean;

  createdBy:
    string;
}


/* =========================================================
   CHECK UNIT EXISTS
========================================================= */

export async function unitExists(
  buildingId: string,
  unitDesc: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(7),
        buildingId
      )

      .input(
        "UnitDesc",
        sql.NVarChar(255),
        unitDesc
      )

      .query(`
        SELECT TOP 1
            1 AS found

        FROM dbo.unit

        WHERE
            LTRIM(RTRIM(build_id))
            =
            LTRIM(RTRIM(@BuildingId))

            AND LTRIM(RTRIM(unit_desc))
            =
            LTRIM(RTRIM(@UnitDesc));
      `);

  return (
    result.recordset.length >
    0
  );
}


/* =========================================================
   GET UNIT IMAGES
========================================================= */

export async function findUnitImages(
  buildingId: string,
  unitDesc: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(7),
        buildingId
      )

      .input(
        "UnitDesc",
        sql.NVarChar(255),
        unitDesc
      )

      .query(`
        SELECT
            imageId,
            buildingId,
            unitDesc,
            fileName,
            fileSize,
            displayOrder,
            isPrimary,
            isActive,
            createdAt,
            updatedAt,
            createdBy,
            imagePath

        FROM dbo.unit_images

        WHERE
            LTRIM(RTRIM(buildingId))
            =
            LTRIM(RTRIM(@BuildingId))

            AND LTRIM(RTRIM(unitDesc))
            =
            LTRIM(RTRIM(@UnitDesc))

            AND ISNULL(
                isActive,
                1
            ) = 1

        ORDER BY
            displayOrder ASC,
            imageId ASC;
      `);

  return result.recordset;
}


/* =========================================================
   AVAILABLE UNITS WITH IMAGES
========================================================= */

export async function findUnitsWithImages() {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .query(`
        SELECT
            UI.buildingId,

            UI.unitDesc,

            MAX(
                B.build_desc
            ) AS buildingName,

            COUNT(*)
                AS imageCount

        FROM dbo.unit_images UI

        LEFT JOIN dbo.building B
            ON LTRIM(
                RTRIM(
                    B.build_id
                )
            )
            =
            LTRIM(
                RTRIM(
                    UI.buildingId
                )
            )

        WHERE
            ISNULL(
                UI.isActive,
                1
            ) = 1

        GROUP BY
            UI.buildingId,
            UI.unitDesc

        HAVING
            COUNT(*) > 0

        ORDER BY
            MAX(
                B.build_desc
            ),
            UI.unitDesc;
      `);

  return result.recordset;
}


/* =========================================================
   NEXT DISPLAY ORDER
========================================================= */

export async function getNextUnitImageDisplayOrder(
  buildingId: string,
  unitDesc: string
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(7),
        buildingId
      )

      .input(
        "UnitDesc",
        sql.NVarChar(255),
        unitDesc
      )

      .query(`
        SELECT
            ISNULL(
                MAX(displayOrder),
                0
            ) + 1
                AS nextOrder,

            COUNT(*)
                AS currentCount

        FROM dbo.unit_images

        WHERE
            LTRIM(RTRIM(buildingId))
            =
            LTRIM(RTRIM(@BuildingId))

            AND LTRIM(RTRIM(unitDesc))
            =
            LTRIM(RTRIM(@UnitDesc))

            AND ISNULL(
                isActive,
                1
            ) = 1;
      `);

  return {
    nextOrder:
      Number(
        result.recordset[0]
          ?.nextOrder ||
          1
      ),

    currentCount:
      Number(
        result.recordset[0]
          ?.currentCount ||
          0
      ),
  };
}


/* =========================================================
   SAVE IMAGE
========================================================= */

export async function saveUnitImage(
  input:
    SaveUnitImageInput
) {
  const pool =
    await getBinShabibEstateNet();

  const result =
    await pool
      .request()

      .input(
        "BuildingId",
        sql.NVarChar(7),
        input.buildingId
      )

      .input(
        "UnitDesc",
        sql.NVarChar(255),
        input.unitDesc
      )

      .input(
        "ImagePath",
        sql.NVarChar(500),
        input.imagePath
      )

      .input(
        "FileName",
        sql.NVarChar(255),
        input.fileName
      )

      .input(
        "FileSize",
        sql.Int,
        input.fileSize
      )

      .input(
        "DisplayOrder",
        sql.Int,
        input.displayOrder
      )

      .input(
        "IsPrimary",
        sql.Bit,
        input.isPrimary
      )

      .input(
        "CreatedBy",
        sql.NVarChar(50),
        input.createdBy
      )

      .query(`
        INSERT INTO dbo.unit_images
        (
            buildingId,
            unitDesc,
            imagePath,
            fileName,
            fileSize,
            displayOrder,
            isPrimary,
            isActive,
            createdAt,
            createdBy
        )
        VALUES
        (
            @BuildingId,
            @UnitDesc,
            @ImagePath,
            @FileName,
            @FileSize,
            @DisplayOrder,
            @IsPrimary,
            1,
            SYSDATETIME(),
            @CreatedBy
        );

        SELECT
            SCOPE_IDENTITY()
            AS imageId;
      `);

  return Number(
    result.recordset[0]
      ?.imageId
  );
}


/* =========================================================
   SAVE ORDER
========================================================= */

export async function updateUnitImageOrder(
  buildingId: string,
  unitDesc: string,
  imageIds: number[]
) {
  const pool =
    await getBinShabibEstateNet();

  const transaction =
    new sql.Transaction(
      pool
    );

  await transaction.begin();

  try {
    for (
      let index = 0;
      index <
      imageIds.length;
      index++
    ) {
      await new sql.Request(
        transaction
      )

        .input(
          "BuildingId",
          sql.NVarChar(7),
          buildingId
        )

        .input(
          "UnitDesc",
          sql.NVarChar(255),
          unitDesc
        )

        .input(
          "ImageId",
          sql.Int,
          imageIds[index]
        )

        .input(
          "DisplayOrder",
          sql.Int,
          index + 1
        )

        .query(`
          UPDATE dbo.unit_images

          SET
              displayOrder =
                  @DisplayOrder,

              updatedAt =
                  SYSDATETIME()

          WHERE
              imageId =
                  @ImageId

              AND LTRIM(
                  RTRIM(
                      buildingId
                  )
              )
              =
              LTRIM(
                  RTRIM(
                      @BuildingId
                  )
              )

              AND LTRIM(
                  RTRIM(
                      unitDesc
                  )
              )
              =
              LTRIM(
                  RTRIM(
                      @UnitDesc
                  )
              )

              AND ISNULL(
                  isActive,
                  1
              ) = 1;
        `);
    }

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}


/* =========================================================
   SET PRIMARY
========================================================= */

export async function setUnitImagePrimary(
  buildingId: string,
  unitDesc: string,
  imageId: number
) {
  const pool =
    await getBinShabibEstateNet();

  const transaction =
    new sql.Transaction(
      pool
    );

  await transaction.begin();

  try {
    const exists =
      await new sql.Request(
        transaction
      )

        .input(
          "BuildingId",
          sql.NVarChar(7),
          buildingId
        )

        .input(
          "UnitDesc",
          sql.NVarChar(255),
          unitDesc
        )

        .input(
          "ImageId",
          sql.Int,
          imageId
        )

        .query(`
          SELECT TOP 1
              imageId

          FROM dbo.unit_images

          WHERE
              imageId =
                  @ImageId

              AND LTRIM(
                  RTRIM(
                      buildingId
                  )
              )
              =
              LTRIM(
                  RTRIM(
                      @BuildingId
                  )
              )

              AND LTRIM(
                  RTRIM(
                      unitDesc
                  )
              )
              =
              LTRIM(
                  RTRIM(
                      @UnitDesc
                  )
              )

              AND ISNULL(
                  isActive,
                  1
              ) = 1;
        `);

    if (
      exists.recordset.length ===
      0
    ) {
      throw new Error(
        "Unit image not found."
      );
    }

    await new sql.Request(
      transaction
    )

      .input(
        "BuildingId",
        sql.NVarChar(7),
        buildingId
      )

      .input(
        "UnitDesc",
        sql.NVarChar(255),
        unitDesc
      )

      .query(`
        UPDATE dbo.unit_images

        SET
            isPrimary = 0,

            updatedAt =
                SYSDATETIME()

        WHERE
            LTRIM(
                RTRIM(
                    buildingId
                )
            )
            =
            LTRIM(
                RTRIM(
                    @BuildingId
                )
            )

            AND LTRIM(
                RTRIM(
                    unitDesc
                )
            )
            =
            LTRIM(
                RTRIM(
                    @UnitDesc
                )
            )

            AND ISNULL(
                isActive,
                1
            ) = 1;
      `);

    await new sql.Request(
      transaction
    )

      .input(
        "ImageId",
        sql.Int,
        imageId
      )

      .query(`
        UPDATE dbo.unit_images

        SET
            isPrimary = 1,

            updatedAt =
                SYSDATETIME()

        WHERE
            imageId =
                @ImageId;
      `);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}


/* =========================================================
   SOFT DELETE IMAGE
========================================================= */

export async function deleteUnitImageRecord(
  buildingId: string,
  unitDesc: string,
  imageId: number
) {
  const pool =
    await getBinShabibEstateNet();

  const transaction =
    new sql.Transaction(
      pool
    );

  await transaction.begin();

  try {
    const result =
      await new sql.Request(
        transaction
      )

        .input(
          "BuildingId",
          sql.NVarChar(7),
          buildingId
        )

        .input(
          "UnitDesc",
          sql.NVarChar(255),
          unitDesc
        )

        .input(
          "ImageId",
          sql.Int,
          imageId
        )

        .query(`
          SELECT TOP 1
              imageId,
              imagePath,
              isPrimary

          FROM dbo.unit_images

          WHERE
              imageId =
                  @ImageId

              AND LTRIM(
                  RTRIM(
                      buildingId
                  )
              )
              =
              LTRIM(
                  RTRIM(
                      @BuildingId
                  )
              )

              AND LTRIM(
                  RTRIM(
                      unitDesc
                  )
              )
              =
              LTRIM(
                  RTRIM(
                      @UnitDesc
                  )
              )

              AND ISNULL(
                  isActive,
                  1
              ) = 1;
        `);

    const image =
      result.recordset[0];

    if (!image) {
      throw new Error(
        "Unit image not found."
      );
    }

    await new sql.Request(
      transaction
    )

      .input(
        "ImageId",
        sql.Int,
        imageId
      )

      .query(`
        UPDATE dbo.unit_images

        SET
            isActive = 0,

            isPrimary = 0,

            updatedAt =
                SYSDATETIME()

        WHERE
            imageId =
                @ImageId;
      `);

    /*
     * Deleted primary:
     * assign another remaining
     * image automatically.
     */
    if (
      Boolean(
        image.isPrimary
      )
    ) {
      const next =
        await new sql.Request(
          transaction
        )

          .input(
            "BuildingId",
            sql.NVarChar(7),
            buildingId
          )

          .input(
            "UnitDesc",
            sql.NVarChar(255),
            unitDesc
          )

          .query(`
            SELECT TOP 1
                imageId

            FROM dbo.unit_images

            WHERE
                LTRIM(
                    RTRIM(
                        buildingId
                    )
                )
                =
                LTRIM(
                    RTRIM(
                        @BuildingId
                    )
                )

                AND LTRIM(
                    RTRIM(
                        unitDesc
                    )
                )
                =
                LTRIM(
                    RTRIM(
                        @UnitDesc
                    )
                )

                AND ISNULL(
                    isActive,
                    1
                ) = 1

            ORDER BY
                displayOrder ASC,
                imageId ASC;
          `);

      if (
        next.recordset.length >
        0
      ) {
        await new sql.Request(
          transaction
        )

          .input(
            "ImageId",
            sql.Int,
            next.recordset[0]
              .imageId
          )

          .query(`
            UPDATE dbo.unit_images

            SET
                isPrimary = 1,

                updatedAt =
                    SYSDATETIME()

            WHERE
                imageId =
                    @ImageId;
          `);
      }
    }

    /*
     * Check whether R2 object
     * is still reused elsewhere.
     */
    const references =
      await new sql.Request(
        transaction
      )

        .input(
          "ImagePath",
          sql.NVarChar(500),
          image.imagePath
        )

        .query(`
          SELECT
              COUNT(*)
                  AS total

          FROM dbo.unit_images

          WHERE
              imagePath =
                  @ImagePath

              AND ISNULL(
                  isActive,
                  1
              ) = 1;
        `);

    await transaction.commit();

    return {
      imagePath:
        image.imagePath,

      remainingReferences:
        Number(
          references
            .recordset[0]
            ?.total ||
            0
        ),
    };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}


/* =========================================================
   REUSE UNIT IMAGES
========================================================= */

export async function reuseUnitImages(
  targetBuildingId:
    string,

  targetUnitDesc:
    string,

  sourceBuildingId:
    string,

  sourceUnitDesc:
    string
) {
  const pool =
    await getBinShabibEstateNet();

  const transaction =
    new sql.Transaction(
      pool
    );

  await transaction.begin();

  try {
    /*
     * Disable current target
     * mappings.
     */
    await new sql.Request(
      transaction
    )

      .input(
        "BuildingId",
        sql.NVarChar(7),
        targetBuildingId
      )

      .input(
        "UnitDesc",
        sql.NVarChar(255),
        targetUnitDesc
      )

      .query(`
        UPDATE dbo.unit_images

        SET
            isActive = 0,

            isPrimary = 0,

            updatedAt =
                SYSDATETIME()

        WHERE
            LTRIM(
                RTRIM(
                    buildingId
                )
            )
            =
            LTRIM(
                RTRIM(
                    @BuildingId
                )
            )

            AND LTRIM(
                RTRIM(
                    unitDesc
                )
            )
            =
            LTRIM(
                RTRIM(
                    @UnitDesc
                )
            )

            AND ISNULL(
                isActive,
                1
            ) = 1;
      `);

    /*
     * Copy source paths.
     *
     * No R2 duplicate file.
     */
    const insert =
      await new sql.Request(
        transaction
      )

        .input(
          "TargetBuildingId",
          sql.NVarChar(7),
          targetBuildingId
        )

        .input(
          "TargetUnitDesc",
          sql.NVarChar(255),
          targetUnitDesc
        )

        .input(
          "SourceBuildingId",
          sql.NVarChar(7),
          sourceBuildingId
        )

        .input(
          "SourceUnitDesc",
          sql.NVarChar(255),
          sourceUnitDesc
        )

        .query(`
          INSERT INTO dbo.unit_images
          (
              buildingId,
              unitDesc,
              imagePath,
              fileName,
              fileSize,
              displayOrder,
              isPrimary,
              isActive,
              createdAt,
              createdBy
          )

          SELECT
              @TargetBuildingId,
              @TargetUnitDesc,
              UI.imagePath,
              UI.fileName,
              UI.fileSize,
              UI.displayOrder,
              UI.isPrimary,
              1,
              SYSDATETIME(),
              'WEBSITE'

          FROM dbo.unit_images UI

          WHERE
              LTRIM(
                  RTRIM(
                      UI.buildingId
                  )
              )
              =
              LTRIM(
                  RTRIM(
                      @SourceBuildingId
                  )
              )

              AND LTRIM(
                  RTRIM(
                      UI.unitDesc
                  )
              )
              =
              LTRIM(
                  RTRIM(
                      @SourceUnitDesc
                  )
              )

              AND ISNULL(
                  UI.isActive,
                  1
              ) = 1;
        `);

    await transaction.commit();

    return (
      insert.rowsAffected[0] ||
      0
    );
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}