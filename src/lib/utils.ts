import { type NativeResponse, type SignaturesOnPage } from "@/types/type";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const convertPdfBufferToBase64 = (pdfBuffer: ArrayBuffer) => {
  // Convert ArrayBuffer to Uint8Array
  const uint8Array = new Uint8Array(pdfBuffer);

  let binaryString = "";
  uint8Array.forEach((byte) => {
    binaryString += String.fromCharCode(byte);
  });

  const base64String = btoa(binaryString);

  return base64String;
};

export const convertBase64ToFile = (
  base64String: string,
  fileName: string,
  mimeType = "application/pdf",
) => {
  // Convert base64 to binary string
  const binaryString = atob(base64String);

  // Create an array buffer from the binary string
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  // Create a Blob from the array buffer
  const blob = new Blob([bytes], { type: mimeType });

  // Create a File object from the Blob
  const file = new File([blob], fileName, { type: mimeType });

  return file;
};

export async function checkSignSecureNative() {
  const response = await fetch("https://localhost:9020/version", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  return (await response.json()) as NativeResponse;
}

export async function getCertificate() {
  const response = await fetch("https://localhost:9020/get-certificate", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "X-API-Token":
        "bnNa4KYWE8PplXOkBe1iPJ7Ghp5J+wE8USJWHFn57KRGO9Cy22lChUuCJ3SOl5ss",
    },
  });
  return (await response.json()) as NativeResponse;
}

export async function encryptPDf(data: string, certificateList: string[]) {
  const response = await fetch("https://localhost:9020/encrypt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Token":
        "bnNa4KYWE8PplXOkBe1iPJ7Ghp5J+wE8USJWHFn57KRGO9Cy22lChUuCJ3SOl5ss",
    },
    body: JSON.stringify({
      data,
      certs: certificateList,
    }),
  });
  return (await response.json()) as NativeResponse;
}

export async function decryptPDf(data: string) {
  const response = await fetch("https://localhost:9020/decrypt", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Token":
        "bnNa4KYWE8PplXOkBe1iPJ7Ghp5J+wE8USJWHFn57KRGO9Cy22lChUuCJ3SOl5ss",
    },
    body: JSON.stringify({
      data,
    }),
  });
  return (await response.json()) as NativeResponse;
}

export async function signWithPages(
  pages: SignaturesOnPage[],
  base64Pdf: string,
) {
  const response = await fetch("https://localhost:9020/sign-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Token":
        "bnNa4KYWE8PplXOkBe1iPJ7Ghp5J+wE8USJWHFn57KRGO9Cy22lChUuCJ3SOl5ss",
    },
    body: JSON.stringify({
      token: "bnNa4KYWE8PplXOkBe1iPJ7Ghp5J+wE8USJWHFn57KRGO9Cy22lChUuCJ3SOl5ss",
      document: {
        source: {
          type: "base64",
          content: base64Pdf,
        },
        output: {
          type: "base64",
        },
      },
      signature: {
        placement: {
          type: "pages",
          pages: pages,
        },
      },
    }),
  });
  return (await response.json()) as NativeResponse;
}

export async function signWithTextPlacement(
  searchText: string,
  base64Pdf: string,
) {
  const response = await fetch("https://localhost:9020/sign-pdf", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-API-Token":
        "bnNa4KYWE8PplXOkBe1iPJ7Ghp5J+wE8USJWHFn57KRGO9Cy22lChUuCJ3SOl5ss",
    },
    body: JSON.stringify({
      token: "bnNa4KYWE8PplXOkBe1iPJ7Ghp5J+wE8USJWHFn57KRGO9Cy22lChUuCJ3SOl5ss",
      document: {
        source: {
          type: "base64",
          content: base64Pdf,
        },
        output: {
          type: "base64",
        },
      },
      signature: {
        placement: {
          type: "text",
          textLocation: {
            searchText,
            pages: [0],
            width: 100,
            height: 100,
          },
        },
      },
    }),
  });
  return (await response.json()) as NativeResponse;
}
