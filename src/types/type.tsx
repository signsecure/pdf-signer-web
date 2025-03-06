export interface SignaturePosition {
  sign: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SignaturesOnPage {
  pageNumber: number;
  signatures: SignaturePosition[];
}

export interface PdfDimensions {
  width: number | null;
  height: number | null;
  aspectRatio: number | null;
}

export interface CertificateInfo {
  certificate: string;
  issuer: string;
  subject: string;
  certificateUsage: string[];
  ValidFrom: string;
  ValidTo: string;
  serialNumber: string;
  signatureAlgorithm: string;
}

export interface NativeResponse {
  document: {
    content: string;
  };
  timestamp: string;
  certificateDetails: CertificateInfo;
  status: boolean;
  tokenExpiry: string;
  error: {
    message: string;
  };
  version: string;
}
