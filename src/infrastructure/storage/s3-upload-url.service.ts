import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'node:crypto';
import { PresignedUploadResult, UploadUrlService } from './storage.types';

@Injectable()
export class S3UploadUrlService implements UploadUrlService {
  private readonly bucket = process.env.AWS_S3_BUCKET as string;
  private readonly region = process.env.AWS_REGION as string;
  private readonly expiresIn = Number(
    process.env.S3_PRESIGNED_EXPIRES_IN ?? 300,
  );

  private readonly client = new S3Client({
    region: this.region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
  });

  async createPresignedUploadUrl(params: {
    filename: string;
    contentType: string;
  }): Promise<PresignedUploadResult> {
    const safeName = params.filename.replace(/[^\w.-]/g, '_');
    const key = `projects/${randomUUID()}-${safeName}`;

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: params.contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: this.expiresIn,
    });

    const fileUrl = `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`;

    return {
      uploadUrl,
      fileUrl,
      key,
      expiresIn: this.expiresIn,
    };
  }
}
