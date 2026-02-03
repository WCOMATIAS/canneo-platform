import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as crypto from 'crypto';

export interface UploadResult {
  key: string;
  url: string;
  bucket: string;
}

export interface SignedUrlOptions {
  expiresIn?: number; // seconds
}

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly configService: ConfigService) {
    const endpoint = this.configService.get<string>('S3_ENDPOINT');
    const region = this.configService.get<string>('S3_REGION', 'us-east-1');
    const accessKeyId = this.configService.get<string>('S3_ACCESS_KEY_ID', '');
    const secretAccessKey = this.configService.get<string>('S3_SECRET_ACCESS_KEY', '');

    this.bucket = this.configService.get<string>('S3_BUCKET', 'canneo-documents');
    this.publicUrl = this.configService.get<string>('S3_PUBLIC_URL', endpoint || '');

    this.s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      forcePathStyle: true, // Required for MinIO compatibility
    });
  }

  /**
   * Generate a unique file key with folder structure
   */
  generateKey(folder: string, filename: string): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const uuid = crypto.randomUUID();
    const ext = filename.split('.').pop() || '';

    return `${folder}/${year}/${month}/${day}/${uuid}.${ext}`;
  }

  /**
   * Upload a file to S3
   */
  async upload(
    buffer: Buffer,
    key: string,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<UploadResult> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      Metadata: metadata,
    });

    await this.s3Client.send(command);
    this.logger.log(`File uploaded: ${key}`);

    return {
      key,
      url: `${this.publicUrl}/${this.bucket}/${key}`,
      bucket: this.bucket,
    };
  }

  /**
   * Get a signed URL for downloading a file
   * @param key - The S3 object key
   * @param options - Options including expiration time (default: 5 minutes)
   */
  async getSignedDownloadUrl(
    key: string,
    options: SignedUrlOptions = {},
  ): Promise<string> {
    const expiresIn = options.expiresIn ?? 300; // 5 minutes default

    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    this.logger.debug(`Generated signed URL for ${key}, expires in ${expiresIn}s`);

    return signedUrl;
  }

  /**
   * Get a signed URL for uploading a file
   * @param key - The S3 object key
   * @param contentType - The expected content type
   * @param options - Options including expiration time (default: 15 minutes)
   */
  async getSignedUploadUrl(
    key: string,
    contentType: string,
    options: SignedUrlOptions = {},
  ): Promise<string> {
    const expiresIn = options.expiresIn ?? 900; // 15 minutes default

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const signedUrl = await getSignedUrl(this.s3Client, command, { expiresIn });
    this.logger.debug(`Generated signed upload URL for ${key}, expires in ${expiresIn}s`);

    return signedUrl;
  }

  /**
   * Delete a file from S3
   */
  async delete(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.s3Client.send(command);
    this.logger.log(`File deleted: ${key}`);
  }

  /**
   * Extract the key from a full S3 URL
   */
  extractKeyFromUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      // Handle both path-style and virtual-hosted-style URLs
      const path = urlObj.pathname;
      // Remove leading slash and bucket name if present
      const parts = path.split('/').filter(Boolean);
      if (parts[0] === this.bucket) {
        return parts.slice(1).join('/');
      }
      return parts.join('/');
    } catch {
      return null;
    }
  }

  /**
   * Calculate SHA-256 hash of a buffer
   */
  calculateHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }
}
