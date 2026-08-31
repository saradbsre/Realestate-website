import {
  PutObjectCommand,
} from "@aws-sdk/client-s3";

import {
  r2Client,
  R2_BUCKET_NAME,
} from "../config/cloudFlareR2";

export async function uploadToR2(
  fileBuffer: Buffer,
  objectKey: string,
  contentType: string
) {
  await r2Client.send(
    new PutObjectCommand({
      Bucket:
        R2_BUCKET_NAME,

      Key:
        objectKey,

      Body:
        fileBuffer,

      ContentType:
        contentType,
    })
  );

  return objectKey;
}