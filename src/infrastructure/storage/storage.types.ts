export type PresignedUploadResult = {
  uploadUrl: string;
  fileUrl: string;
  key: string;
  expiresIn: number;
};

export interface UploadUrlService {
  createPresignedUploadUrl(params: {
    filename: string;
    contentType: string;
  }): Promise<PresignedUploadResult>;
}

export const UPLOAD_URL_SERVICE = Symbol('UPLOAD_URL_SERVICE');
