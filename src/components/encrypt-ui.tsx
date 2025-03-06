import {
  convertBase64ToFile,
  convertPdfBufferToBase64,
  encryptPDf,
  getCertificate,
} from "@/lib/utils";
import { useFileState } from "@/state/file-state";
import { api } from "@/trpc/react";
import React, { useState } from "react";
import { X, Plus, Mail } from "lucide-react";

export function EncryptUI() {
  const { file, setFile } = useFileState();
  const [email, setEmail] = useState("");
  const [emailList, setEmailList] = useState<string[]>([]);
  const [emailError, setEmailError] = useState("");
  const [certificateList, setCertificateList] = useState<string[]>([]);

  const utils = api.useUtils();

  const { data: isCertificatePresent, isLoading } =
    api.certificate.isCertificatePresent.useQuery();

  const getCertificateMutation =
    api.certificate.getCertificateRegistered.useMutation();

  const registerCertificateMutation =
    api.certificate.registerCertificate.useMutation({
      onSuccess: async () => {
        await utils.certificate.invalidate();
      },
    });

  async function handleRegisterCertificate() {
    const response = await getCertificate();
    if (response.status === true) {
      registerCertificateMutation.mutate({
        certificate: response.certificateDetails.certificate,
      });
    }
  }

  async function handleEncryptClick() {
    if (emailList.length === 0) {
      setEmailError("Please add at least one email address");
      return;
    }
    if (!file) {
      return;
    }
    const pdfBytes = await file?.arrayBuffer();
    // Replace with your actual encryption function
    const response = await encryptPDf(
      convertPdfBufferToBase64(pdfBytes),
      certificateList,
    );
    if (response.status === true) {
      setFile(convertBase64ToFile(response.document.content, "encrypted.pdf"));
      setEmailList([]);
      setCertificateList([]);
      setEmail("");
    }
  }

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleAddEmail = async () => {
    if (!email.trim()) {
      setEmailError("Email cannot be empty");
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      return;
    }

    if (emailList.includes(email)) {
      setEmailError("This email is already in the list");
      return;
    }

    const certificateData = await getCertificateMutation.mutateAsync({
      email,
    });

    if (!certificateData?.isPresent) {
      setEmailError("This email has not registered its certificate");
      return;
    }
    setCertificateList([...certificateList, certificateData.certificate ?? ""]);
    setEmailList([...emailList, email]);
    setEmail("");
    setEmailError("");
  };

  const handleRemoveEmail = (emailToRemove: string) => {
    setEmailList(emailList.filter((e) => e !== emailToRemove));
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

  if (isLoading) {
    return <></>;
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <button
            onClick={handleAddEmail}
            className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-white hover:bg-primary/90"
          >
            <Plus size={18} />
          </button>
        </div>

        {emailError && <p className="text-sm text-red-500">{emailError}</p>}

        {emailList.length > 0 && (
          <div className="mt-2 space-y-2">
            <p className="text-xs text-gray-500">
              {emailList.length} recipient{emailList.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-2">
              {emailList.map((email, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm"
                >
                  <span className="max-w-[150px] truncate">{email}</span>
                  <button
                    onClick={() => handleRemoveEmail(email)}
                    className="ml-1 rounded-full p-0.5 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
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
          className="w-full rounded-lg bg-green-500 px-4 py-2 text-white transition-colors hover:bg-green-600"
          onClick={handleRegisterCertificate}
        >
          Register Certificate
        </button>
      )}

      <button
        className={`w-full rounded-lg px-4 py-2 text-white transition-colors ${
          emailList.length > 0
            ? "bg-green-500 hover:bg-green-600"
            : "cursor-not-allowed bg-gray-400"
        }`}
        onClick={handleEncryptClick}
        disabled={emailList.length === 0}
      >
        Encrypt PDF
      </button>
    </div>
  );
}
