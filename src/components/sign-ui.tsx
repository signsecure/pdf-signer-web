"use client";

import {
  convertBase64ToFile,
  convertPdfBufferToBase64,
  signWithPages,
  signWithTextPlacement,
} from "@/lib/utils";
import { useFileState } from "@/state/file-state";
import { usePagesState } from "@/state/pages-state";
import { SignaturePlacementType } from "@/types/enums";
import { type NativeResponse } from "@/types/type";
import { useState } from "react";
import type React from "react";

interface SignUIProps {
  onAddSignature: () => void;
}

export const SignUI: React.FC<SignUIProps> = ({ onAddSignature }) => {
  const [signMethod, setSignMethod] = useState<SignaturePlacementType>(
    SignaturePlacementType.PAGES,
  );
  const { pages, setPages } = usePagesState();
  const { file, setFile } = useFileState();

  const [signatureSearchText, setSignatureSearchText] = useState("");

  const handleSignClick = async () => {
    if (!file) {
      return;
    }
    let response: NativeResponse;
    const pdfBytes = await file.arrayBuffer();

    switch (signMethod) {
      case SignaturePlacementType.PAGES:
        response = await signWithPages(
          pages,
          convertPdfBufferToBase64(pdfBytes),
        );
        break;
      case SignaturePlacementType.TEXT:
        response = await signWithTextPlacement(
          signatureSearchText,
          convertPdfBufferToBase64(pdfBytes),
        );
        break;
    }

    if (response.status == true && response.document.content) {
      setFile(convertBase64ToFile(response.document.content, "signed.pdf"));
      setPages([]);
    } else {
      alert("Error signing document");
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Signature Options</h3>
      <div className="mb-4 flex space-x-2">
        <button
          className={`rounded-lg px-4 py-2 transition-colors ${
            signMethod === SignaturePlacementType.PAGES
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setSignMethod(SignaturePlacementType.PAGES)}
        >
          Add on Viewer
        </button>
        <button
          className={`rounded-lg px-4 py-2 transition-colors ${
            signMethod === SignaturePlacementType.TEXT
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
          onClick={() => setSignMethod(SignaturePlacementType.TEXT)}
        >
          Specify Text
        </button>
      </div>
      {signMethod === SignaturePlacementType.PAGES ? (
        <button
          className="w-full rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
          onClick={onAddSignature}
        >
          Add Signature on Viewer
        </button>
      ) : (
        <div>
          <label
            htmlFor="signatureLocation"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Signature Location (text on PDF)
          </label>
          <input
            type="text"
            id="signatureLocation"
            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter text near signature location"
            onChange={(e) => setSignatureSearchText(e.target.value)}
            value={signatureSearchText}
          />
        </div>
      )}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="allPages"
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="allPages" className="ml-2 block text-sm text-gray-900">
          Apply to all pages
        </label>
      </div>
      <button
        className="w-full rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
        onClick={handleSignClick}
      >
        Apply Signature
      </button>
    </div>
  );
};
