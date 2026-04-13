import { Module } from '@nestjs/common';
import { S3UploadUrlService } from './s3-upload-url.service';
import { UPLOAD_URL_SERVICE } from './storage.types';

@Module({
  providers: [
    {
      provide: UPLOAD_URL_SERVICE,
      useClass: S3UploadUrlService,
    },
  ],
  exports: [UPLOAD_URL_SERVICE],
})
export class StorageModule {}
