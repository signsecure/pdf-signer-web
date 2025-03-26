"use client";

import { Download, Upload, FileText, ExternalLink } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface FileHeaderProps {
  file: File | null;
  onChangeFile: () => void;
}

export const FileHeader = ({ file, onChangeFile }: FileHeaderProps) => {
  // Download PDF function
  const handleDownloadPDF = () => {
    if (file) {
      // Create a URL for the file
      const fileURL = URL.createObjectURL(file);

      // Create a temporary anchor element
      const downloadLink = document.createElement("a");
      downloadLink.href = fileURL;

      // Set the download attribute with the original filename
      downloadLink.download = file.name;

      // Append to the document, click it, and remove it
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Clean up the URL object
      URL.revokeObjectURL(fileURL);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / 1048576).toFixed(2) + " MB";
  };

  return (
    <div className="border-b bg-white p-4">
      {file ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2
                className="truncate text-sm font-medium text-gray-700"
                title={file.name}
              >
                {file.name}
              </h2>
              <p className="text-xs text-gray-500">
                {formatFileSize(file.size)}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={handleDownloadPDF}
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 border-primary/20 text-primary hover:bg-primary/5"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download PDF</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={onChangeFile}
                    size="icon"
                    variant="outline"
                    className="h-8 w-8 border-primary/20 text-primary hover:bg-primary/5"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Change PDF</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
              <FileText className="h-5 w-5 text-gray-400" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-500">
                No file selected
              </h2>
              <p className="text-xs text-gray-400">Select a PDF to begin</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-1 text-xs"
            onClick={() => window.open("https://signsecure.in", "_blank")}
          >
            <ExternalLink className="h-3.5 w-3.5" />
            SignSecure
          </Button>
        </motion.div>
      )}
    </div>
  );
};
