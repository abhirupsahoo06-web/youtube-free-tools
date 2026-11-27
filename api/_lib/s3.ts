import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export function getMissingS3Config(): string[] {
  const missing: string[] = []
  if (!process.env.S3_BUCKET?.trim()) missing.push('S3_BUCKET')
  if (!process.env.S3_REGION?.trim()) missing.push('S3_REGION')
  if (!process.env.S3_ACCESS_KEY_ID?.trim()) missing.push('S3_ACCESS_KEY_ID')
  if (!process.env.S3_SECRET_ACCESS_KEY?.trim()) missing.push('S3_SECRET_ACCESS_KEY')
  return missing
}

export function isS3Configured(): boolean {
  return getMissingS3Config().length === 0
}

function createS3Client(): S3Client {
  const region = process.env.S3_REGION!.trim()
  const endpoint = process.env.S3_ENDPOINT?.trim() || undefined
  const forcePathStyle = process.env.S3_FORCE_PATH_STYLE === 'true'

  return new S3Client({
    region,
    endpoint,
    forcePathStyle,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID!.trim(),
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!.trim(),
    },
  })
}

export async function createSignedUploadUrl(params: {
  objectKey: string
  contentType: string
  contentLength: number
}): Promise<{ uploadUrl: string; expiresInSeconds: number }> {
  const client = createS3Client()
  const expiresInSeconds = 900
  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET!.trim(),
    Key: params.objectKey,
    ContentType: params.contentType,
    ContentLength: params.contentLength,
  })

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: expiresInSeconds })
  return { uploadUrl, expiresInSeconds }
}

export async function verifyUploadedObject(objectKey: string): Promise<{
  exists: boolean
  contentLength?: number
}> {
  const client = createS3Client()
  try {
    const res = await client.send(
      new HeadObjectCommand({
        Bucket: process.env.S3_BUCKET!.trim(),
        Key: objectKey,
      })
    )
    return {
      exists: true,
      contentLength: res.ContentLength,
    }
  } catch {
    return { exists: false }
  }
}
