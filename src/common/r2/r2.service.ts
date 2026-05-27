import { Injectable } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';

export interface UploadFile {
  originalname: string;
  mimetype: string;
  buffer: Buffer;
}

@Injectable()
export class R2Service {
  private client: S3Client;
  private bucket: string;
  private publicUrl: string;

  constructor(private config: ConfigService) {
    this.bucket = config.get('R2_BUCKET')!;
    this.publicUrl = config.get('R2_PUBLIC_URL')!;

    this.client = new S3Client({
      region: 'auto',
      endpoint: `https://${config.get('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.get('R2_ACCESS_KEY')!,
        secretAccessKey: config.get('R2_SECRET_KEY')!,
      },
    });
  }

  async upload(file: UploadFile, folder = 'uploads'): Promise<string> {
    const ext = file.originalname.split('.').pop();
    const key = `${folder}/${uuidv4()}.${ext}`;

    await this.client.send(new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }));

    return `${this.publicUrl}/${key}`;
  }

  async delete(url: string): Promise<void> {
    const key = url.replace(`${this.publicUrl}/`, '');
    await this.client.send(new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    }));
  }
}