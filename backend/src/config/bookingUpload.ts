import multer from "multer";

const MAX_PASSPORT_SIZE =
  5 * 1024 * 1024; // 5 MB

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
];

export const bookingUpload = multer({
  /*
   * Keep uploaded passport only in memory.
   *
   * We insert the Buffer directly
   * into SQL Server.
   */
  storage: multer.memoryStorage(),

  limits: {
    fileSize: MAX_PASSPORT_SIZE,

    /*
     * Only one passport file.
     */
    files: 1,

    /*
     * Protect against huge multipart requests
     * containing hundreds of fields.
     */
    fields: 10,
  },

  fileFilter: (
    req,
    file,
    callback
  ) => {
    if (
      !ALLOWED_MIME_TYPES.includes(
        file.mimetype
      )
    ) {
      return callback(
        new Error(
          "Passport must be PDF, JPG or PNG."
        )
      );
    }

    callback(null, true);
  },
});