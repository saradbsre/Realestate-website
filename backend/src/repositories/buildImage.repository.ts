import sql from "mssql";
import { getBinShabibEstateNet } from "../config/BinShabibEstate";

export interface SaveBuildImageInput {
  buildingId: string;
  imagePath: string;
  fileName: string | null;
  fileSize: number | null;
  displayOrder: number;
  isPrimary: boolean;
  createdBy: string;
}

export async function findBuildImages(
  buildingId: string
) {
  const pool = await getBinShabibEstateNet();

  const result = await pool
    .request()
    .input(
      "BuildingId",
      sql.NVarChar(7),
      buildingId
    )
    .query(`
      SELECT
          imageId,
          buildingId,
          imagePath,
          fileName,
          fileSize,
          displayOrder,
          isPrimary,
          isActive,
          createdAt,
          updatedAt,
          createdBy
      FROM dbo.build_images
      WHERE
          LTRIM(RTRIM(buildingId))
          =
          LTRIM(RTRIM(@BuildingId))
          AND ISNULL(isActive, 1) = 1
      ORDER BY
          isPrimary DESC,
          displayOrder ASC,
          imageId ASC;
    `);

  return result.recordset;
}

export async function getNextBuildImageDisplayOrder(
  buildingId: string
) {
  const pool = await getBinShabibEstateNet();

  const result = await pool
    .request()
    .input(
      "BuildingId",
      sql.NVarChar(7),
      buildingId
    )
    .query(`
      SELECT
          ISNULL(MAX(displayOrder), 0) + 1 AS nextOrder,
          COUNT(*) AS currentCount
      FROM dbo.build_images
      WHERE
          buildingId = @BuildingId
          AND ISNULL(isActive, 1) = 1;
    `);

  return {
    nextOrder: Number(
      result.recordset[0]?.nextOrder || 1
    ),

    currentCount: Number(
      result.recordset[0]?.currentCount || 0
    ),
  };
}

export async function saveBuildImage(
  input: SaveBuildImageInput
) {
  const pool = await getBinShabibEstateNet();

  const result = await pool
    .request()
    .input(
      "BuildingId",
      sql.NVarChar(7),
      input.buildingId
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
      INSERT INTO dbo.build_images
      (
          buildingId,
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
          @ImagePath,
          @FileName,
          @FileSize,
          @DisplayOrder,
          @IsPrimary,
          1,
          SYSDATETIME(),
          @CreatedBy
      );

      SELECT SCOPE_IDENTITY() AS imageId;
    `);

  return Number(
    result.recordset[0]?.imageId
  );
}

export async function findBuildImageById(
  buildingId: string,
  imageId: number
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
        "ImageId",
        sql.Int,
        imageId
      )

      .query(`
        SELECT TOP 1
            imageId,
            buildingId,
            imagePath,
            fileName,
            fileSize,
            displayOrder,
            isPrimary,
            isActive

        FROM dbo.build_images

        WHERE
            imageId = @ImageId

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

            AND ISNULL(
                isActive,
                1
            ) = 1;
      `);

  return (
    result.recordset[0] ||
    null
  );
}
export async function updateBuildImageOrder(
  buildingId: string,
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
          UPDATE dbo.build_images

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
   SET PRIMARY IMAGE
========================================================= */

export async function setBuildImagePrimary(
  buildingId: string,
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
          "ImageId",
          sql.Int,
          imageId
        )

        .query(`
          SELECT TOP 1
              imageId

          FROM dbo.build_images

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
        "Image not found."
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

      .query(`
        UPDATE dbo.build_images

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

            AND ISNULL(
                isActive,
                1
            ) = 1;
      `);

    await new sql.Request(
      transaction
    )
      .input(
        "BuildingId",
        sql.NVarChar(7),
        buildingId
      )

      .input(
        "ImageId",
        sql.Int,
        imageId
      )

      .query(`
        UPDATE dbo.build_images

        SET
            isPrimary = 1,
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

            AND ISNULL(
                isActive,
                1
            ) = 1;
      `);

    await transaction.commit();
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}


/* =========================================================
   DELETE BUILD IMAGE
========================================================= */

export async function deleteBuildImageRecord(
  buildingId: string,
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
    const imageResult =
      await new sql.Request(
        transaction
      )
        .input(
          "BuildingId",
          sql.NVarChar(7),
          buildingId
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

          FROM dbo.build_images

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

              AND ISNULL(
                  isActive,
                  1
              ) = 1;
        `);

    const image =
      imageResult.recordset[0];

    if (!image) {
      throw new Error(
        "Image not found."
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
        UPDATE dbo.build_images

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
     * If deleted image was primary,
     * assign first remaining image.
     */
    if (image.isPrimary) {
      const nextImage =
        await new sql.Request(
          transaction
        )
          .input(
            "BuildingId",
            sql.NVarChar(7),
            buildingId
          )

          .query(`
            SELECT TOP 1
                imageId

            FROM dbo.build_images

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

                AND ISNULL(
                    isActive,
                    1
                ) = 1

            ORDER BY
                displayOrder ASC,
                imageId ASC;
          `);

      if (
        nextImage.recordset.length >
        0
      ) {
        await new sql.Request(
          transaction
        )
          .input(
            "ImageId",
            sql.Int,
            nextImage
              .recordset[0]
              .imageId
          )

          .query(`
            UPDATE dbo.build_images

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

    await transaction.commit();

    return {
      imagePath:
        image.imagePath,
    };
  } catch (error) {
    await transaction.rollback();

    throw error;
  }
}