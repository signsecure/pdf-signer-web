"use client";

import {
  convertBase64ToFile,
  convertPdfBufferToBase64,
  decryptPDf,
} from "@/lib/utils";
import { useFileState } from "@/state/file-state";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export const DecryptUi = () => {
  const { file, setFile } = useFileState();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDecryptClick() {
    if (!file) {
      toast.error("Please select a file to decrypt");
      return;
    }

    setIsLoading(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const response = await decryptPDf(convertPdfBufferToBase64(pdfBytes));

      if (response.status === true && response.document.content) {
        setFile(
          convertBase64ToFile(response.document.content, "decrypted.pdf"),
        );
        toast.success("PDF decrypted successfully");
      } else {
        toast.error(response.error.message || "Failed to decrypt PDF");
      }
    } catch (error) {
      console.error("Error decrypting PDF:", error);
      toast.error("An unexpected error occurred while decrypting the PDF");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Decryption Options</h3>
      <button
        className="flex w-full items-center justify-center rounded-lg bg-[#007acc] px-4 py-2 text-white transition-colors hover:bg-[#0056b3] disabled:cursor-not-allowed disabled:bg-gray-400"
        onClick={handleDecryptClick}
        disabled={isLoading || !file}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Decrypting PDF...
          </>
        ) : (
          "Decrypt PDF"
        )}
      </button>
    </div>
  );
};
