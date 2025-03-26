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
import {
  X,
  Plus,
  Mail,
  Loader2,
  AlertTriangle,
  CheckCircle,
  KeyRound,
  BadgeCheck,
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Alert, AlertDescription } from "./ui/alert";

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
    if (!email.trim() || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (emailList.includes(email)) {
      toast.error("This email is already added");
      return;
    }

    setIsAddingEmail(true);
    try {
      const response = await getCertificateMutation.mutateAsync({
        email,
      });

      if (response.certificate) {
        setEmailList([...emailList, email]);
        setCertificateList([...certificateList, response.certificate]);
        setEmail("");
      } else {
        toast.error(`No certificate found for ${email}`);
      }
    } catch (error) {
      console.error("Error getting certificate:", error);
      toast.error(
        "An unexpected error occurred while retrieving the certificate",
      );
    } finally {
      setIsAddingEmail(false);
    }
  };

  const handleRemoveEmail = (index: number) => {
    const newEmailList = [...emailList];
    const newCertificateList = [...certificateList];
    newEmailList.splice(index, 1);
    newCertificateList.splice(index, 1);
    setEmailList(newEmailList);
    setCertificateList(newCertificateList);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      void handleAddEmail();
    }
  };

  return (
    <div className="space-y-5">
      <div className="mb-4 flex items-center gap-2">
        <KeyRound className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Encryption Options</h3>
      </div>

      {!isCertificatePresent && !isCheckingCertificate && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <Alert className="border-amber-200 bg-amber-50 text-amber-800">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="ml-2 text-sm">
              <span className="font-medium">Certificate required. </span>
              You need to register a certificate first to encrypt documents.
            </AlertDescription>
          </Alert>

          <div className="mt-3 flex justify-center">
            <Button
              variant="outline"
              className="border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
              onClick={handleRegisterCertificate}
              disabled={isRegisteringCertificate}
            >
              {isRegisteringCertificate ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering...
                </>
              ) : (
                <>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Register Certificate
                </>
              )}
            </Button>
          </div>
        </motion.div>
      )}

      {isCertificatePresent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-3"
        >
          <Alert className="border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="ml-2 text-sm">
              Certificate is registered and ready for use.
            </AlertDescription>
          </Alert>
        </motion.div>
      )}

      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Recipients (who can decrypt this PDF)
        </label>

        <div className="flex items-center gap-2">
          <div className="relative flex-grow">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter email address"
              className="pl-3 pr-10"
              disabled={isAddingEmail || isEncrypting}
            />
            <Mail className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          </div>
          <Button
            onClick={() => void handleAddEmail()}
            variant="outline"
            size="icon"
            className="h-9 w-9 border-primary/30 bg-primary/5 text-primary hover:bg-primary/10 hover:text-primary"
            disabled={isAddingEmail || !email.trim() || isEncrypting}
          >
            {isAddingEmail ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus size={18} />
            )}
          </Button>
        </div>

        <AnimatePresence>
          {emailList.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden rounded-md border border-gray-200 bg-gray-50"
            >
              <div className="p-3">
                <h4 className="mb-2 text-xs font-medium text-gray-500">
                  Recipients:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {emailList.map((email, index) => (
                    <motion.div
                      key={email}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
                    >
                      <Mail className="mr-1 h-3.5 w-3.5" />
                      <span className="max-w-[120px] truncate">{email}</span>
                      <button
                        onClick={() => handleRemoveEmail(index)}
                        className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary/20 text-primary hover:bg-primary/30"
                        disabled={isEncrypting}
                        aria-label="Remove recipient"
                      >
                        <X size={10} />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Button
        className="mt-2 w-full"
        onClick={handleEncryptClick}
        disabled={
          emailList.length === 0 || !file || isEncrypting || isAddingEmail
        }
      >
        {isEncrypting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Encrypting PDF...
          </>
        ) : (
          <>
            <KeyRound className="mr-2 h-4 w-4" />
            Encrypt PDF
          </>
        )}
      </Button>
    </div>
  );
}
