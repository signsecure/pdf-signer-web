"use client";

import {
  convertBase64ToFile,
  convertPdfBufferToBase64,
  decryptPDf,
} from "@/lib/utils";
import { useFileState } from "@/state/file-state";
import { useState } from "react";
import { Loader2, UnlockKeyhole, ShieldX, Info } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { Alert, AlertDescription } from "./ui/alert";

export const DecryptUi = () => {
  const { file, setFile } = useFileState();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDecryptClick() {
    if (!file) {
      toast.error("Please select a file to decrypt");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const pdfBytes = await file.arrayBuffer();
      const response = await decryptPDf(convertPdfBufferToBase64(pdfBytes));

      if (response.status === true && response.document.content) {
        setFile(
          convertBase64ToFile(response.document.content, "decrypted.pdf"),
        );
        toast.success("PDF decrypted successfully");
      } else {
        setError(response.error.message || "Failed to decrypt PDF");
        toast.error(response.error.message || "Failed to decrypt PDF");
      }
    } catch (error) {
      console.error("Error decrypting PDF:", error);
      const errorMessage =
        "An unexpected error occurred while decrypting the PDF";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="mb-4 flex items-center gap-2">
        <UnlockKeyhole className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Decryption Options</h3>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Alert className="mb-5 border-blue-200 bg-blue-50 text-blue-800">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="ml-2 text-sm">
            You can decrypt this PDF if you have permission to access it.
          </AlertDescription>
        </Alert>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <Alert className="border-red-200 bg-red-50 text-red-800">
              <ShieldX className="h-4 w-4 text-red-600" />
              <AlertDescription className="ml-2 text-sm">
                {error}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">
                Selected File
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                {file ? file.name : "No file selected"}
              </p>
            </div>
            <div
              className={`h-3 w-3 rounded-full ${file ? "bg-green-500" : "bg-gray-300"}`}
            ></div>
          </div>
        </div>

        <Button
          className="mt-5 w-full"
          onClick={handleDecryptClick}
          disabled={isLoading || !file}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Decrypting PDF...
            </>
          ) : (
            <>
              <UnlockKeyhole className="mr-2 h-4 w-4" />
              Decrypt PDF
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
};
