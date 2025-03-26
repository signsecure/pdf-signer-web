import { TextPosition, type SignerNameText } from "@/types/enums";

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

export interface SignatureAppearance {
  showTimestamp: boolean;
  showValidityIcon: boolean;
  image?: string;
  signerNameText?: SignerNameText;
  customText?: string;
  reason?: string;
  location?: string;
  authorizedBy?: string;
}

export interface TextPlacement {
  pages?: number[];
  searchText: string;
  width: number;
  height: number;
  position?: TextPosition;
  gap?: number;
}
