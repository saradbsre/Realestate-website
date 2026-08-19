export interface BookingValidationInput {
  propertyId: unknown;
  propertyName: unknown;
  name: unknown;
  email: unknown;
  phone: unknown;
  nationality: unknown;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export function cleanText(
  value: unknown
): string {
  return String(
    value ?? ""
  )
    .trim()
    .replace(/\s+/g, " ");
}

/*
|--------------------------------------------------------------------------
| Required fields
|--------------------------------------------------------------------------
*/

export function validateBookingFields(
  input: BookingValidationInput
): ValidationResult {
  const propertyId =
    cleanText(input.propertyId);

  const propertyName =
    cleanText(input.propertyName);

  const name =
    cleanText(input.name);

  const email =
    cleanText(input.email);

  const phone =
    cleanText(input.phone);

  const nationality =
    cleanText(input.nationality);

  if (!propertyId) {
    return {
      valid: false,
      error:
        "Property reference is required.",
    };
  }

  if (!propertyName) {
    return {
      valid: false,
      error:
        "Property name is required.",
    };
  }

  if (!name) {
    return {
      valid: false,
      error:
        "Full name is required.",
    };
  }

  if (!email) {
    return {
      valid: false,
      error:
        "Email address is required.",
    };
  }

  if (!phone) {
    return {
      valid: false,
      error:
        "Phone number is required.",
    };
  }

  if (!nationality) {
    return {
      valid: false,
      error:
        "Nationality is required.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Length validation
  |--------------------------------------------------------------------------
  */

  if (propertyId.length > 20) {
    return {
      valid: false,
      error:
        "Invalid property reference.",
    };
  }

  if (propertyName.length > 300) {
    return {
      valid: false,
      error:
        "Property name is too long.",
    };
  }

  if (
    name.length < 2 ||
    name.length > 150
  ) {
    return {
      valid: false,
      error:
        "Please enter a valid full name.",
    };
  }

  if (email.length > 254) {
    return {
      valid: false,
      error:
        "Email address is too long.",
    };
  }

  if (phone.length > 50) {
    return {
      valid: false,
      error:
        "Phone number is too long.",
    };
  }

  if (nationality.length > 100) {
    return {
      valid: false,
      error:
        "Invalid nationality.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Email validation
  |--------------------------------------------------------------------------
  */

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (
    !emailRegex.test(email)
  ) {
    return {
      valid: false,
      error:
        "Please enter a valid email address.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Phone validation
  |--------------------------------------------------------------------------
  |
  | Allows:
  |
  | +971501234567
  | 0501234567
  | +971 50 123 4567
  | 04 329 8000
  |
  */

  const normalizedPhone =
    phone.replace(
      /[\s\-().]/g,
      ""
    );

  const phoneRegex =
    /^\+?[0-9]{7,15}$/;

  if (
    !phoneRegex.test(
      normalizedPhone
    )
  ) {
    return {
      valid: false,
      error:
        "Please enter a valid phone number.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | Property ID
  |--------------------------------------------------------------------------
  |
  | Allows ERP references such as:
  |
  | P:385
  | P:894
  | 12345
  |
  */

  const propertyIdRegex =
    /^[A-Za-z0-9:_\-]+$/;

  if (
    !propertyIdRegex.test(
      propertyId
    )
  ) {
    return {
      valid: false,
      error:
        "Invalid property reference.",
    };
  }

  return {
    valid: true,
  };
}

/*
|--------------------------------------------------------------------------
| Validate actual file content
|--------------------------------------------------------------------------
|
| Browser supplied MIME type alone should
| not be trusted.
|
*/

export function validatePassportFile(
  file:
    | Express.Multer.File
    | undefined
): ValidationResult {
  if (!file) {
    return {
      valid: false,
      error:
        "Passport copy is required.",
    };
  }

  if (
    file.size <= 0
  ) {
    return {
      valid: false,
      error:
        "Passport file is empty.",
    };
  }

  if (
    file.size >
    5 * 1024 * 1024
  ) {
    return {
      valid: false,
      error:
        "Passport copy must not exceed 5 MB.",
    };
  }

  const allowedMimeTypes = [
    "application/pdf",
    "image/jpeg",
    "image/png",
  ];

  if (
    !allowedMimeTypes.includes(
      file.mimetype
    )
  ) {
    return {
      valid: false,
      error:
        "Passport must be PDF, JPG or PNG.",
    };
  }

  if (
    !file.buffer ||
    file.buffer.length === 0
  ) {
    return {
      valid: false,
      error:
        "Passport file could not be read.",
    };
  }

  /*
  |--------------------------------------------------------------------------
  | PDF signature
  |--------------------------------------------------------------------------
  |
  | %PDF
  |
  */

  if (
    file.mimetype ===
    "application/pdf"
  ) {
    const isPdf =
      file.buffer.length >= 4 &&
      file.buffer[0] === 0x25 &&
      file.buffer[1] === 0x50 &&
      file.buffer[2] === 0x44 &&
      file.buffer[3] === 0x46;

    if (!isPdf) {
      return {
        valid: false,
        error:
          "The uploaded file is not a valid PDF.",
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | JPEG signature
  |--------------------------------------------------------------------------
  |
  | FF D8 FF
  |
  */

  if (
    file.mimetype ===
    "image/jpeg"
  ) {
    const isJpeg =
      file.buffer.length >= 3 &&
      file.buffer[0] === 0xff &&
      file.buffer[1] === 0xd8 &&
      file.buffer[2] === 0xff;

    if (!isJpeg) {
      return {
        valid: false,
        error:
          "The uploaded file is not a valid JPG image.",
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | PNG signature
  |--------------------------------------------------------------------------
  */

  if (
    file.mimetype ===
    "image/png"
  ) {
    const pngSignature = [
      0x89,
      0x50,
      0x4e,
      0x47,
      0x0d,
      0x0a,
      0x1a,
      0x0a,
    ];

    const isPng =
      file.buffer.length >= 8 &&
      pngSignature.every(
        (byte, index) =>
          file.buffer[index] ===
          byte
      );

    if (!isPng) {
      return {
        valid: false,
        error:
          "The uploaded file is not a valid PNG image.",
      };
    }
  }

  /*
  |--------------------------------------------------------------------------
  | Filename
  |--------------------------------------------------------------------------
  */

  if (
    file.originalname.length >
    255
  ) {
    return {
      valid: false,
      error:
        "Passport filename is too long.",
    };
  }

  return {
    valid: true,
  };
}