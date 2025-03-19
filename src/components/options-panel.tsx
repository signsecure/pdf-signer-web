"use client";

import type React from "react";

import { useState } from "react";
import {
  ChevronRight,
  Fingerprint,
  Lock,
  Unlock,
  AlertTriangle,
} from "lucide-react";
import { SignUI } from "./sign-ui";
import { EncryptUI } from "./encrypt-ui";
import { api } from "@/trpc/react";
import { DecryptUi } from "./decrypt-ui";
import { checkSignSecureNative } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export const OptionsPanel: React.FC<{ onAddSignature: () => void }> = ({
  onAddSignature,
}) => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  api.certificate.isCertificatePresent.usePrefetchQuery();

  // Use React Query to handle the async checkSignSecureNative function
  const { data: isNativeAvailable, isLoading: isCheckingNative } = useQuery({
    queryKey: ["checkSignSecureNative"],
    queryFn: async () => {
      try {
        const result = await checkSignSecureNative();
        return result;
      } catch (error) {
        console.error("Error checking for SignSecure native app:", error);
        return false;
      }
    },
    // Keep the result fresh but don't refetch too often
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return (
    <div className="w-full">
      <div className="p-4">
        {isNativeAvailable === false && !isCheckingNative && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <div className="flex items-start">
              <AlertTriangle className="mr-2 mt-0.5 h-5 w-5 flex-shrink-0" />
              <div>
                <h3 className="font-medium">
                  SignSecure Desktop <br />
                  Not Detected
                </h3>

                <p className="mt-1 text-sm">
                  PDF actions require the SignSecure desktop application. Please
                  install and run the desktop app to enable these features.
                </p>
                <p className="mt-2 text-sm font-bold">
                  Only Windows is supported.
                </p>
                <a
                  href="https://signsecure.in/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block text-sm font-medium text-red-800 hover:underline"
                >
                  Download SignSecure Desktop
                </a>
              </div>
            </div>
          </div>
        )}

        <h2 className="mb-2 text-lg font-semibold text-gray-900">
          PDF Actions
        </h2>
        {selectedOption === null ? (
          <div className="space-y-4">
            {isCheckingNative ? (
              // Show loading state while checking for native app
              <div className="py-4 text-center text-gray-500">
                <div className="flex items-center justify-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-[#007acc] border-t-transparent"></div>
                  <span>Checking for SignSecure desktop app...</span>
                </div>
              </div>
            ) : (
              // Show action buttons once check is complete
              ["sign", "encrypt", "decrypt"].map((option) => (
                <button
                  key={option}
                  className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-colors duration-200 ${
                    !isNativeAvailable
                      ? "cursor-not-allowed bg-gray-100 text-gray-400"
                      : "bg-[#007acc]/5 hover:bg-[#007acc]/10"
                  }`}
                  onClick={() => isNativeAvailable && setSelectedOption(option)}
                  disabled={!isNativeAvailable}
                >
                  <div className="flex items-center space-x-3">
                    {option === "sign" && (
                      <Fingerprint className="h-5 w-5 text-[#007acc]" />
                    )}
                    {option === "encrypt" && (
                      <Lock className="h-5 w-5 text-[#007acc]" />
                    )}
                    {option === "decrypt" && (
                      <Unlock className="h-5 w-5 text-[#007acc]" />
                    )}
                    <span className="font-medium capitalize">{option}</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-[#007acc]" />
                </button>
              ))
            )}
          </div>
        ) : (
          <div>
            <button
              className="mb-4 flex items-center text-[#007acc] hover:text-[#0056b3]"
              onClick={() => setSelectedOption(null)}
            >
              <ChevronRight className="mr-1 h-5 w-5 rotate-180 transform" />
              Back to Actions
            </button>
            {selectedOption === "sign" && (
              <SignUI onAddSignature={onAddSignature} />
            )}
            {selectedOption === "encrypt" && <EncryptUI />}
            {selectedOption === "decrypt" && <DecryptUi />}
          </div>
        )}
      </div>
    </div>
  );
};
