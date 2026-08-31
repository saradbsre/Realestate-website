"use client";

import React, {
  useCallback,
  useEffect,
  useState,
} from "react";

import styles
  from "./UnitImageManager.module.css";
import CommonAlert, {
  type AlertType,
} from "../../components/CommonAlert";

const API_URL =
  process.env
    .NEXT_PUBLIC_API_URL ||
  "";



/* =========================================================
   TYPES
========================================================= */

interface UnitImage {
  imageId: number;

  buildingId: string;

  unitDesc: string;

  imagePath: string;

  imageUrl:
    string | null;

  fileName:
    string | null;

  fileSize:
    number | null;

  displayOrder: number;

  isPrimary: boolean;
}


interface ExistingUnit {
  buildingId: string;

  unitDesc: string;

  buildingName:
    string | null;

  imageCount: number;
}


interface Props {
  buildingId: string;

  unitDesc: string;
}



/* =========================================================
   COMPONENT
========================================================= */

export default function UnitImageManager({
  buildingId,
  unitDesc,
}: Props) {
  const [
    images,
    setImages,
  ] =
    useState<UnitImage[]>(
      []
    );

  const [
    existingUnits,
    setExistingUnits,
  ] =
    useState<
      ExistingUnit[]
    >([]);

  const [
    selectedSource,
    setSelectedSource,
  ] =
    useState("");

  const [
    selectedFile,
    setSelectedFile,
  ] =
    useState<File | null>(
      null
    );

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    uploading,
    setUploading,
  ] =
    useState(false);

  const [
    reusing,
    setReusing,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    error,
    setError,
  ] =
    useState("");

    
const [
  draggingImageId,
  setDraggingImageId,
] = useState<
  number | null
>(null);

const [
  orderChanged,
  setOrderChanged,
] = useState(false);

const [
  savingOrder,
  setSavingOrder,
] = useState(false);

const [
  deletingImageId,
  setDeletingImageId,
] = useState<
  number | null
>(null);

const [
  primaryImageId,
  setPrimaryImageId,
] = useState<
  number | null
>(null);

const [
  alertConfig,
  setAlertConfig,
] = useState<{
  open: boolean;
  type: AlertType;
  title: string;
  message: string;
  confirmText: string;
  showCancel: boolean;
  loading: boolean;
  onConfirm:
    (() => void) |
    null;
}>({
  open: false,

  type: "confirm",

  title: "",

  message: "",

  confirmText: "OK",

  showCancel: false,

  loading: false,

  onConfirm: null,
});

const closeAlert =
  () => {
    setAlertConfig(
      (current) => ({
        ...current,

        open: false,

        loading: false,

        onConfirm: null,
      })
    );
  };

  const showAlertSuccess =
  (
    message:
      string
  ) => {
    setAlertConfig({
      open: true,

      type: "success",

      title: "Success",

      message,

      confirmText: "OK",

      showCancel: false,

      loading: false,

      onConfirm:
        closeAlert,
    });
  };

  const showAlertError =
  (
    message:
      string
  ) => {
    setAlertConfig({
      open: true,

      type: "error",

      title: "Error",

      message,

      confirmText: "Close",

      showCancel: false,

      loading: false,

      onConfirm:
        closeAlert,
    });
  };
  /* =========================================================
     LOAD CURRENT IMAGES
  ========================================================= */

  const loadImages =
    useCallback(
      async () => {
        if (
          !buildingId ||
          !unitDesc
        ) {
          return;
        }

        setLoading(
          true
        );

        try {
          const response =
            await fetch(
              `${API_URL}/api/admin/unit-images/${encodeURIComponent(
                buildingId
              )}/${encodeURIComponent(
                unitDesc
              )}`,
              {
                credentials:
                  "include",
              }
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.error ||
                "Unable to load images."
            );
          }
setImages(
  Array.isArray(
    result.data
  )
    ? result.data
    : []
);

setOrderChanged(
  false
);

setDraggingImageId(
  null
);
        } catch (
          err: any
        ) {
          setError(
            err.message ||
              "Unable to load images."
          );
        } finally {
          setLoading(
            false
          );
        }
      },
      [
        buildingId,
        unitDesc,
      ]
    );


  /* =========================================================
     LOAD EXISTING UNITS HAVING IMAGES
  ========================================================= */

  const loadExistingUnits =
    useCallback(
      async () => {
        try {
          const response =
            await fetch(
              `${API_URL}/api/admin/unit-images/available-units`,
              {
                credentials:
                  "include",
              }
            );

          const result =
            await response.json();

          if (
            !response.ok ||
            !result.success
          ) {
            throw new Error(
              result.error ||
                "Unable to load existing units."
            );
          }

          const filtered =
            (
              result.data ||
              []
            ).filter(
              (
                item:
                  ExistingUnit
              ) =>
                !(
                  item.buildingId ===
                    buildingId &&
                  item.unitDesc ===
                    unitDesc
                )
            );

          setExistingUnits(
            filtered
          );
        } catch (
          err: any
        ) {
          console.error(
            err
          );
        }
      },
      [
        buildingId,
        unitDesc,
      ]
    );


  useEffect(
    () => {
      loadImages();

      loadExistingUnits();
    },
    [
      loadImages,
      loadExistingUnits,
    ]
  );


  /* =========================================================
     UPLOAD NEW IMAGE
  ========================================================= */

  const handleUpload =
    async () => {
      if (
        !selectedFile
      ) {
        setError(
          "Please select an image."
        );

        return;
      }

      if (
        selectedFile.size >
        5 *
          1024 *
          1024
      ) {
        setError(
          "Image size must not exceed 5 MB."
        );

        return;
      }

      setUploading(
        true
      );

      setError("");
      setMessage("");

      try {
        const formData =
          new FormData();

        formData.append(
          "image",
          selectedFile
        );

        const response =
          await fetch(
            `${API_URL}/api/admin/unit-images/${encodeURIComponent(
              buildingId
            )}/${encodeURIComponent(
              unitDesc
            )}/upload`,
            {
              method:
                "POST",

              credentials:
                "include",

              body:
                formData,
            }
          );

        const result =
          await response.json();

        if (
          !response.ok ||
          !result.success
        ) {
          throw new Error(
            result.error ||
              "Image upload failed."
          );
        }

        setMessage(
          "Image uploaded successfully."
        );

        setSelectedFile(
          null
        );

        await loadImages();

        await loadExistingUnits();
      } catch (
        err: any
      ) {
        setError(
          err.message ||
            "Image upload failed."
        );
      } finally {
        setUploading(
          false
        );
      }
    };


  /* =========================================================
     REUSE EXISTING UNIT IMAGES
  ========================================================= */

const handleReuse =
  () => {
    if (
      !selectedSource
    ) {
      showAlertError(
        "Please select an existing unit."
      );

      return;
    }

    const source =
      existingUnits.find(
        (item) =>
          `${item.buildingId}|||${item.unitDesc}` ===
          selectedSource
      );

    if (!source) {
      showAlertError(
        "Invalid source unit."
      );

      return;
    }

    setAlertConfig({
      open: true,

      type: "warning",

      title:
        "Reuse Unit Images",

      message:
        `Use the same ${source.imageCount} image(s) from Unit ${source.unitDesc}? Existing images mapped to Unit ${unitDesc} will be replaced.`,

      confirmText:
        "Use Images",

      showCancel:
        true,

      loading:
        false,

      onConfirm:
        () =>
          confirmReuseImages(
            source
          ),
    });
  };

  const confirmReuseImages =
  async (
    source:
      ExistingUnit
  ) => {
    try {
      setAlertConfig(
        (current) => ({
          ...current,

          loading:
            true,
        })
      );

      setReusing(
        true
      );

      setError("");
      setMessage("");

      const response =
        await fetch(
          `${API_URL}/api/admin/unit-images/${encodeURIComponent(
            buildingId
          )}/${encodeURIComponent(
            unitDesc
          )}/reuse`,
          {
            method:
              "POST",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                sourceBuildingId:
                  source.buildingId,

                sourceUnitDesc:
                  source.unitDesc,
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Unable to reuse images."
        );
      }

      setSelectedSource(
        ""
      );

      await loadImages();

      await loadExistingUnits();

      showAlertSuccess(
        result.message ||
          "Images reused successfully."
      );
    } catch (
      err: any
    ) {
      showAlertError(
        err.message ||
          "Unable to reuse images."
      );
    } finally {
      setReusing(
        false
      );
    }
  };

  /* =========================================================
     FORMAT FILE SIZE
  ========================================================= */

  const formatFileSize = (
    bytes:
      number | null
  ) => {
    if (!bytes) {
      return "";
    }

    const mb =
      bytes /
      1024 /
      1024;

    if (mb >= 1) {
      return `${mb.toFixed(
        2
      )} MB`;
    }

    return `${(
      bytes / 1024
    ).toFixed(
      0
    )} KB`;
  };

/* =========================================================
   DRAG / DROP
========================================================= */

const handleDragStart =
  (
    imageId:
      number
  ) => {
    setDraggingImageId(
      imageId
    );
  };


const handleDragOver =
  (
    event:
      React.DragEvent<HTMLDivElement>,

    targetImageId:
      number
  ) => {
    event.preventDefault();

    if (
      draggingImageId ===
        null ||
      draggingImageId ===
        targetImageId
    ) {
      return;
    }

    setImages(
      (current) => {
        const updated =
          [...current];

        const fromIndex =
          updated.findIndex(
            (image) =>
              image.imageId ===
              draggingImageId
          );

        const toIndex =
          updated.findIndex(
            (image) =>
              image.imageId ===
              targetImageId
          );

        if (
          fromIndex === -1 ||
          toIndex === -1
        ) {
          return current;
        }

        const [
          movedImage,
        ] =
          updated.splice(
            fromIndex,
            1
          );

        updated.splice(
          toIndex,
          0,
          movedImage
        );

        return updated.map(
          (
            image,
            index
          ) => ({
            ...image,

            displayOrder:
              index + 1,
          })
        );
      }
    );

    setOrderChanged(
      true
    );
  };


const handleDragEnd =
  () => {
    setDraggingImageId(
      null
    );
  };



  const handleSaveOrder =
  async () => {
    if (
      images.length ===
        0 ||
      !buildingId ||
      !unitDesc
    ) {
      return;
    }

    try {
      setSavingOrder(
        true
      );

      setError("");
      setMessage("");

      const response =
        await fetch(
          `${API_URL}/api/admin/unit-images/${encodeURIComponent(
            buildingId
          )}/${encodeURIComponent(
            unitDesc
          )}/order`,
          {
            method:
              "PATCH",

            credentials:
              "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                imageIds:
                  images.map(
                    (image) =>
                      image.imageId
                  ),
              }),
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Unable to save image order."
        );
      }

      showAlertSuccess(
        "Image order saved successfully."
      );

      setOrderChanged(
        false
      );

      await loadImages();
    } catch (
      err: any
    ) {
      showAlertError(
        err.message ||
          "Unable to save image order."
      );
    } finally {
      setSavingOrder(
        false
      );
    }
  };


  const handleSetPrimary =
  async (
    imageId:
      number
  ) => {
    try {
      setPrimaryImageId(
        imageId
      );

      setError("");
      setMessage("");

      const response =
        await fetch(
          `${API_URL}/api/admin/unit-images/${encodeURIComponent(
            buildingId
          )}/${encodeURIComponent(
            unitDesc
          )}/${imageId}/primary`,
          {
            method:
              "PATCH",

            credentials:
              "include",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Unable to set primary image."
        );
      }

      setImages(
        (current) =>
          current.map(
            (image) => ({
              ...image,

              isPrimary:
                image.imageId ===
                imageId,
            })
          )
      );

      showAlertSuccess(
        "Primary image updated successfully."
      );
    } catch (
      err: any
    ) {
      showAlertError(
        err.message ||
          "Unable to set primary image."
      );
    } finally {
      setPrimaryImageId(
        null
      );
    }
  };

const handleDeleteImage =
  (
    image:
      UnitImage
  ) => {
    setAlertConfig({
      open: true,

      type: "warning",

      title:
        "Delete Unit Image",

      message:
        `Are you sure you want to delete ${
          image.fileName ||
          "this image"
        } from Unit ${unitDesc}?`,

      confirmText:
        "Delete",

      showCancel:
        true,

      loading:
        false,

      onConfirm:
        () =>
          confirmDeleteImage(
            image
          ),
    });
  };



  const confirmDeleteImage =
  async (
    image:
      UnitImage
  ) => {
    try {
      setAlertConfig(
        (current) => ({
          ...current,

          loading:
            true,
        })
      );

      setDeletingImageId(
        image.imageId
      );

      const response =
        await fetch(
          `${API_URL}/api/admin/unit-images/${encodeURIComponent(
            buildingId
          )}/${encodeURIComponent(
            unitDesc
          )}/${image.imageId}`,
          {
            method:
              "DELETE",

            credentials:
              "include",
          }
        );

      const result =
        await response.json();

      if (
        !response.ok ||
        !result.success
      ) {
        throw new Error(
          result.error ||
            "Unable to delete image."
        );
      }

      await loadImages();

      await loadExistingUnits();

      showAlertSuccess(
        "Unit image deleted successfully."
      );
    } catch (
      err: any
    ) {
      showAlertError(
        err.message ||
          "Unable to delete image."
      );
    } finally {
      setDeletingImageId(
        null
      );
    }
  };
  /* =========================================================
     UI
  ========================================================= */

  return (
    <div
      className={
        styles.container
      }
    >
      <div
        className={
          styles.header
        }
      >
        <div>
          <h3>
            Unit Images
          </h3>

          <p>
            Building{" "}
            {buildingId}
            {" • "}
            Unit{" "}
            {unitDesc}
          </p>
        </div>
      </div>


      {error && (
        <div
          className={
            styles.error
          }
        >
          {error}
        </div>
      )}


      {message && (
        <div
          className={
            styles.success
          }
        >
          {message}
        </div>
      )}


      {/* =====================================================
          UPLOAD NEW
      ====================================================== */}

      <div
        className={
          styles.actionCard
        }
      >
        <div
          className={
            styles.actionTitle
          }
        >
          Upload New Image
        </div>

        <div
          className={
            styles.uploadRow
          }
        >
          <input
            type="file"

            accept=
              "image/jpeg,image/png,image/webp"

            onChange={(
              event
            ) => {
              setSelectedFile(
                event.target
                  .files?.[0] ||
                  null
              );

              setError("");
            }}

            className={
              styles.fileInput
            }
          />

          <button
            type="button"

            onClick={
              handleUpload
            }

            disabled={
              uploading ||
              !selectedFile
            }

            className={
              styles.primaryButton
            }
          >
            {uploading
              ? "Uploading..."
              : "Upload Image"}
          </button>
        </div>

        <div
          className={
            styles.helpText
          }
        >
          JPG, PNG or WebP.
          Maximum size 5 MB.
        </div>
      </div>


      {/* =====================================================
          REUSE UNIT IMAGES
      ====================================================== */}

      <div
        className={
          styles.actionCard
        }
      >
        <div
          className={
            styles.actionTitle
          }
        >
          Use Images From
          Existing Unit
        </div>

        <p
          className={
            styles.actionDescription
          }
        >
          Select a unit that
          already has images.
          The same images will be used
          without uploading
          duplicate files.
        </p>

        <div
          className={
            styles.reuseRow
          }
        >
          <select
            value={
              selectedSource
            }

            onChange={(
              event
            ) =>
              setSelectedSource(
                event.target
                  .value
              )
            }

            className={
              styles.select
            }
          >
            <option value="">
              Select existing
              unit
            </option>

            {existingUnits.map(
              (item) => (
                <option
                  key={
                    `${item.buildingId}-${item.unitDesc}`
                  }

                  value={
                    `${item.buildingId}|||${item.unitDesc}`
                  }
                >
                  {item.buildingName ||
                    item.buildingId}

                  {" - Unit "}

                  {item.unitDesc}

                  {` (${item.imageCount} images)`}
                </option>
              )
            )}
          </select>

          <button
            type="button"

            onClick={
              handleReuse
            }

            disabled={
              reusing ||
              !selectedSource
            }

            className={
              styles.secondaryButton
            }
          >
            {reusing
              ? "Applying..."
              : "Use Same Images"}
          </button>
        </div>
      </div>

{images.length >
  1 && (
  <div
    className={
      styles.orderToolbar
    }
  >
    <div>
      <strong>
        Image Display Order
      </strong>

      <span>
        Drag images to
        rearrange them.
      </span>
    </div>

    <button
      type="button"

      onClick={
        handleSaveOrder
      }

      disabled={
        !orderChanged ||
        savingOrder
      }

      className={
        styles.primaryButton
      }
    >
      {savingOrder
        ? "Saving..."
        : "Save Order"}
    </button>
  </div>
)}
      {/* =====================================================
          CURRENT IMAGES
      ====================================================== */}

      <div
        className={
          styles.imagesSection
        }
      >
        <div
          className={
            styles.sectionTitle
          }
        >
          Current Images (
          {images.length})
        </div>

        {loading ? (
          <div
            className={
              styles.empty
            }
          >
            Loading images...
          </div>
        ) : images.length ===
          0 ? (
          <div
            className={
              styles.empty
            }
          >
            No images added
            for this unit.
          </div>
        ) : (
          <div
            className={
              styles.imageGrid
            }
          >
          {images.map(
  (
    image,
    index
  ) => (
    <div
      key={
        image.imageId
      }

      draggable

      onDragStart={() =>
        handleDragStart(
          image.imageId
        )
      }

      onDragOver={(
        event
      ) =>
        handleDragOver(
          event,
          image.imageId
        )
      }

      onDragEnd={
        handleDragEnd
      }

      className={`${styles.imageCard} ${
        draggingImageId ===
        image.imageId
          ? styles.imageCardDragging
          : ""
      }`}
    >
      {/* DRAG */}

      <div
       
      >
        
      </div>


      {/* IMAGE */}

      <div
        className={
          styles.imagePreview
        }
      >
        {image.imageUrl ? (
          <img
            src={
              image.imageUrl
            }

            alt={
              image.fileName ||
              "Unit image"
            }

            draggable={
              false
            }
          />
        ) : (
          <div>
            Image URL unavailable
          </div>
        )}


        {/* ORDER */}

        <span
          className={
            styles.orderBadge
          }
        >
          #{index + 1}
        </span>


        {/* PRIMARY */}

        {image.isPrimary && (
          <span
            className={
              styles.primaryBadge
            }
          >
            Primary
          </span>
        )}
      </div>


      {/* INFORMATION */}

      <div
        className={
          styles.imageInfo
        }
      >
        <div
          className={
            styles.fileName
          }
        >
          {image.fileName ||
            "Image"}
        </div>

        

        <div
          className={
            styles.fileSize
          }
        >
          {formatFileSize(
            image.fileSize
          )}
        </div>
      </div>


      {/* ACTIONS */}

      <div
        className={
          styles.imageActions
        }
      >
        <button
          type="button"

          disabled={
            image.isPrimary ||
            primaryImageId ===
              image.imageId
          }

          onClick={() =>
            handleSetPrimary(
              image.imageId
            )
          }

          className={
            styles.setPrimaryButton
          }
        >
          {primaryImageId ===
          image.imageId
            ? "Updating..."
            : image.isPrimary
            ? "Primary Image"
            : "Set Primary"}
        </button>


        <button
          type="button"

          disabled={
            deletingImageId ===
            image.imageId
          }

          onClick={() =>
            handleDeleteImage(
              image
            )
          }

          className={
            styles.deleteButton
          }
        >
          {deletingImageId ===
          image.imageId
            ? "Deleting..."
            : "Delete"}
        </button>
      </div>
    </div>
  )
)}
          </div>
        )}
      </div>
      <CommonAlert
  open={
    alertConfig.open
  }

  type={
    alertConfig.type
  }

  title={
    alertConfig.title
  }

  message={
    alertConfig.message
  }

  confirmText={
    alertConfig.confirmText
  }

  showCancel={
    alertConfig.showCancel
  }

  inputRequired={
    false
  }

  inputLabel=""
  inputPlaceholder=""
  inputValue=""

  loading={
    alertConfig.loading
  }

  onInputChange={() => {}}

  onConfirm={() => {
    alertConfig.onConfirm?.();
  }}

  onCancel={
    closeAlert
  }
/>
    </div>
  );
}