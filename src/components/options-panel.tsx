"use client";

import type React from "react";

import { useState } from "react";
import {
  ChevronRight,
  Fingerprint,
  Lock,
  Unlock,
  AlertTriangle,
  ArrowLeft,
  Download,
  Shield,
} from "lucide-react";
import { SignUI } from "./sign-ui";
import { EncryptUI } from "./encrypt-ui";
import { api } from "@/trpc/react";
import { DecryptUi } from "./decrypt-ui";
import { checkSignSecureNative } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

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
          <motion.div
            className="mb-6 overflow-hidden rounded-lg border border-red-200 bg-red-50 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-red-100 p-2">
              <h3 className="text-center text-sm font-semibold text-red-800">
                SignSecure Desktop Required
              </h3>
            </div>
            <div className="flex items-start p-4">
              <AlertTriangle className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <p className="text-sm text-red-700">
                  PDF operations require the SignSecure desktop application.
                  Please install and run the desktop app to enable these
                  features.
                </p>
                <p className="mt-2 text-xs font-medium text-red-800">
                  Only Windows is currently supported
                </p>
                <a
                  href="https://signsecure.in/download"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1 rounded-md bg-red-100 px-3 py-1.5 text-xs font-medium text-red-800 hover:bg-red-200"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download SignSecure Desktop
                </a>
              </div>
            </div>
          </motion.div>
        )}

        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Shield className="h-5 w-5 text-primary" />
          PDF Actions
        </h2>

        {selectedOption === null ? (
          <div className="grid gap-3">
            {isCheckingNative ? (
              // Show loading state while checking for native app
              <div className="flex items-center justify-center rounded-lg bg-gray-50 py-8 text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="text-sm font-medium">
                    Checking for SignSecure desktop app...
                  </span>
                </div>
              </div>
            ) : (
              // Show action buttons once check is complete
              <div className="grid gap-3 sm:grid-cols-1">
                {[
                  {
                    key: "sign",
                    icon: <Fingerprint className="h-5 w-5" />,
                    title: "Sign Document",
                    description: "Add digital signatures to your PDF",
                  },
                  {
                    key: "encrypt",
                    icon: <Lock className="h-5 w-5" />,
                    title: "Encrypt PDF",
                    description: "Secure your document with encryption",
                  },
                  {
                    key: "decrypt",
                    icon: <Unlock className="h-5 w-5" />,
                    title: "Decrypt PDF",
                    description: "Access encrypted PDF documents",
                  },
                ].map((option) => (
                  <motion.button
                    key={option.key}
                    whileHover={{ scale: !isNativeAvailable ? 1 : 1.02 }}
                    whileTap={{ scale: !isNativeAvailable ? 1 : 0.98 }}
                    className={`group flex flex-col rounded-xl p-4 text-left transition-colors duration-200 ${
                      !isNativeAvailable
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "bg-white hover:bg-primary/5 hover:shadow-md"
                    } border`}
                    onClick={() =>
                      isNativeAvailable && setSelectedOption(option.key)
                    }
                    disabled={!isNativeAvailable}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <div
                        className={`flex h-10 w-10 items-center justify-center rounded-full ${!isNativeAvailable ? "bg-gray-200" : "bg-primary/10"}`}
                      >
                        <span
                          className={
                            !isNativeAvailable
                              ? "text-gray-400"
                              : "text-primary"
                          }
                        >
                          {option.icon}
                        </span>
                      </div>
                      <ChevronRight
                        className={`h-5 w-5 transform transition-transform duration-300 ${!isNativeAvailable ? "text-gray-300" : "text-primary group-hover:translate-x-1"}`}
                      />
                    </div>
                    <h3 className="font-medium">{option.title}</h3>
                    <p className="mt-1 text-xs text-gray-500">
                      {option.description}
                    </p>
                  </motion.button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
              onClick={() => setSelectedOption(null)}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Actions
            </button>

            <div className="rounded-xl border bg-white p-4 shadow-sm">
              {selectedOption === "sign" && (
                <SignUI onAddSignature={onAddSignature} />
              )}
              {selectedOption === "encrypt" && <EncryptUI />}
              {selectedOption === "decrypt" && <DecryptUi />}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
