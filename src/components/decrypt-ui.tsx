import {
  convertBase64ToFile,
  convertPdfBufferToBase64,
  decryptPDf,
} from "@/lib/utils";
import { useFileState } from "@/state/file-state";
import React from "react";

export const DecryptUi = () => {
  const { file, setFile } = useFileState();

  async function handleDecryptClick() {
    if (!file) {
      return;
    }
    const pdfBytes = await file?.arrayBuffer();
    // Replace with your actual encryption function
    const response = await decryptPDf(convertPdfBufferToBase64(pdfBytes));
    if (response.status === true) {
      setFile(convertBase64ToFile(response.document.content, "encrypted.pdf"));
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Decryption Options</h3>
      <button
        className="w-full rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
        onClick={handleDecryptClick}
      >
        Decrypt PDF
      </button>
    </div>
  );
};
