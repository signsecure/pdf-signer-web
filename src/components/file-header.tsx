"use client";

import { Upload, Download } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FileHeaderProps {
  file: File | undefined;
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

  return (
    <div className="flex items-center justify-between border-b bg-white p-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#007acc]/10">
          <svg
            className="h-5 w-5 text-[#007acc]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-medium text-gray-700">
            {file ? file.name : "No file selected"}
          </h2>
          <p className="text-xs text-gray-500">
            {(file ? file.size : 0) / 1024 / 1024} MB
          </p>
        </div>
      </div>
      <div className="flex flex-shrink-0 gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-2 rounded-lg border border-[#007acc]/30 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#007acc]/5 focus:outline-none focus:ring-2 focus:ring-[#007acc] focus:ring-offset-2"
              >
                <Download className="h-4 w-4 text-[#007acc]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Download PDF</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onChangeFile}
                className="flex items-center gap-2 rounded-lg border border-[#007acc]/30 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-[#007acc]/5 focus:outline-none focus:ring-2 focus:ring-[#007acc] focus:ring-offset-2"
              >
                <Upload className="h-4 w-4 text-[#007acc]" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Change PDF</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
};
