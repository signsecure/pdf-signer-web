"use client";

import {
  convertBase64ToFile,
  convertPdfBufferToBase64,
  encryptPDf,
  getCertificate,
} from "@/lib/utils";
import { useFileState } from "@/state/file-state";
import { api } from "@/trpc/react";
import { useState } from "react";
import { X, Plus, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function EncryptUI() {
  const { file, setFile } = useFileState();
  const [email, setEmail] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [certificateList, setCertificateList] = useState<string[]>([]);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isRegisteringCertificate, setIsRegisteringCertificate] =
    useState(false);
  const [isAddingEmail, setIsAddingEmail] = useState(false);

  const utils = api.useUtils();

  const { data: isCertificatePresent, isLoading: isCheckingCertificate } =
    api.certificate.isCertificatePresent.useQuery();

  const getCertificateMutation =
    api.certificate.getCertificateRegistered.useMutation();

  const registerCertificateMutation =
    api.certificate.registerCertificate.useMutation({
      onSuccess: async () => {
        await utils.certificate.invalidate();
        toast.success("Certificate registered successfully");
      },
      onError: (error) => {
        toast.error(`Failed to register certificate: ${error.message}`);
      },
    });

  async function handleRegisterCertificate() {
    setIsRegisteringCertificate(true);
    try {
      const response = await getCertificate();
      if (response.status === true) {
        await registerCertificateMutation.mutateAsync({
          certificate: response.certificateDetails.certificate,
        });
      } else {
        toast.error(response.error.message || "Failed to get certificate");
      }
    } catch (error) {
      console.error("Error registering certificate:", error);
      toast.error("An unexpected error occurred while registering certificate");
    } finally {
      setIsRegisteringCertificate(false);
    }
  }

  async function handleEncryptClick() {
    if (emailList.length === 0) {
      toast.error("Please add at least one email address");
      return;
    }

    if (!file) {
      toast.error("Please select a file to encrypt");
      return;
    }

    setIsEncrypting(true);
    try {
      const pdfBytes = await file.arrayBuffer();
      const response = await encryptPDf(
        convertPdfBufferToBase64(pdfBytes),
        certificateList,
      );

      if (response.status === true && response.document.content) {
        setFile(
          convertBase64ToFile(response.document.content, "encrypted.pdf"),
        );
        setEmailList([]);
        setCertificateList([]);
        setEmail("");
        toast.success("PDF encrypted successfully");
      } else {
        toast.error(response.error.message || "Failed to encrypt PDF");
      }
    } catch (error) {
      console.error("Error encrypting PDF:", error);
      toast.error("An unexpected error occurred while encrypting the PDF");
    } finally {
      setIsEncrypting(false);
    }
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAddEmail = async () => {
    if (!email.trim()) {
      toast.error("Email cannot be empty");
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emailList.includes(email)) {
      toast.error("This email is already in the list");
      return;
    }

    setIsAddingEmail(true);
    try {
      const certificateData = await getCertificateMutation.mutateAsync({
        email,
      });

      if (!certificateData?.isPresent) {
        toast.error("This email has not registered its certificate");
        return;
      }

      setCertificateList([
        ...certificateList,
        certificateData.certificate ?? "",
      ]);
      setEmailList([...emailList, email]);
      setEmail("");
      toast.success(`Added ${email} to recipients`);
    } catch (error) {
      console.error("Error adding email:", error);
      toast.error("Failed to verify certificate for this email");
    } finally {
      setIsAddingEmail(false);
    }
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailList(emailList.filter((e) => e !== emailToRemove));
    toast.info(`Removed ${emailToRemove} from recipients`);
  };

  const handleKeyDown = async (e: {
    key: string;
    preventDefault: () => void;
  }) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleAddEmail();
    }
  };

  if (isCheckingCertificate) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#007acc]" />
        <span className="ml-2">Checking certificate status...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Encryption Options</h3>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Recipients (who can decrypt this PDF)
        </label>

        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter email address"
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-[#007acc] focus:outline-none focus:ring-1 focus:ring-[#007acc]"
              disabled={isAddingEmail}
            />
            <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={handleAddEmail}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-[#007acc] text-white hover:bg-[#0056b3] disabled:cursor-not-allowed disabled:bg-gray-400"
            disabled={isAddingEmail || !email.trim()}
          >
            {isAddingEmail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus size={18} />
            )}
          </button>
        </div>

        {emailList.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-gray-500">
              {emailList.length} recipient{emailList.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {emailList.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 rounded-full bg-[#007acc]/10 px-3 py-1 text-sm"
                >
                  <span className="max-w-[150px] truncate">{email}</span>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-1 rounded-full p-0.5 text-gray-500 hover:bg-[#007acc]/20 hover:text-gray-700"
                    disabled={isEncrypting}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {!isCertificatePresent?.isPresent && (
        <button
          className="flex w-full items-center justify-center rounded-lg bg-[#007acc] px-4 py-2 text-white transition-colors hover:bg-[#0056b3] disabled:cursor-not-allowed disabled:bg-gray-400"
          onClick={handleRegisterCertificate}
          disabled={isRegisteringCertificate}
        >
          {isRegisteringCertificate ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering Certificate...
            </>
          ) : (
            "Register Certificate"
          )}
        </button>
      )}

      <button
        className="flex w-full items-center justify-center rounded-lg bg-[#007acc] px-4 py-2 text-white transition-colors hover:bg-[#0056b3] disabled:cursor-not-allowed disabled:bg-gray-400"
        onClick={handleEncryptClick}
        disabled={emailList.length === 0 || !file || isEncrypting}
      >
        {isEncrypting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Encrypting PDF...
          </>
        ) : (
          "Encrypt PDF"
        )}
      </button>
    </div>
  );
}
