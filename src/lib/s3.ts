import { createReadStream } from 'fs'
import { readFile, rm } from 'fs/promises'
import { dirname } from 'path'

import { S3Client } from '@aws-sdk/client-s3'
import {
  DeleteObjectCommand,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectsCommand
} from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  endpoint: process.env.NEXT_PUBLIC_S3_STORAGE_URL,
  region: '12club',
  credentials: {
    accessKeyId: process.env.S3_STORAGE_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_STORAGE_SECRET_ACCESS_KEY!
  }
})

export const uploadVideoToS3 = async (
  filePath: string,
  fileName: string,
  mimeType: string,
  uniqueId: string
) => {
  const fileStream = createReadStream(filePath || '')

  const bucketName = `resource/${uniqueId}/video/${fileName}`

  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.S3_STORAGE_BUCKET_NAME!,
    Key: bucketName,
    Body: fileStream,
    ContentType: mimeType
  })
  await s3.send(uploadCommand)
}

export const uploadImageToS3 = async (key: string, fileBuffer: Buffer) => {
  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.S3_STORAGE_BUCKET_NAME!,
    Key: key,
    Body: fileBuffer,
    ContentType: 'application/octet-stream'
  })
  await s3.send(uploadCommand)
}

export const uploadFileToS3 = async (key: string, filePath: string) => {
  const fileBuffer = await readFile(filePath || '')
  const uploadCommand = new PutObjectCommand({
    Bucket: process.env.S3_STORAGE_BUCKET_NAME!,
    Key: key,
    Body: fileBuffer,
    ContentType: 'application/octet-stream'
  })
  await s3.send(uploadCommand)

  const folderPath = dirname(filePath)
  await rm(folderPath, { recursive: true, force: true })
}

export const deleteFileFromS3 = async (key: string) => {
  const deleteCommand = new DeleteObjectCommand({
    Bucket: process.env.S3_STORAGE_BUCKET_NAME!,
    Key: key
  })
  await s3.send(deleteCommand)
}

/**
 * 删除S3中指定前缀的所有文件（模拟删除文件夹）
 * @param prefix 文件夹前缀，例如 'resource/123/video/'
 */
export const deleteFolderFromS3 = async (prefix: string) => {
  const bucket = process.env.S3_STORAGE_BUCKET_NAME!

  // 确保前缀以 '/' 结尾
  const folderPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`

  // 列出所有以该前缀开头的对象
  const listCommand = new ListObjectsV2Command({
    Bucket: bucket,
    Prefix: folderPrefix
  })

  const response = await s3.send(listCommand)

  if (!response.Contents || response.Contents.length === 0) {
    return // 没有找到任何对象
  }

  // 准备批量删除的对象列表
  const objectsToDelete = response.Contents.map((obj) => ({ Key: obj.Key! }))

  // 批量删除对象
  const deleteCommand = new DeleteObjectsCommand({
    Bucket: bucket,
    Delete: {
      Objects: objectsToDelete
    }
  })

  await s3.send(deleteCommand)
}
