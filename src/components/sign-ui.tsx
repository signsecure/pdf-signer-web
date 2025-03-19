"use client";

import {
  convertBase64ToFile,
  convertPdfBufferToBase64,
  signWithPages,
  signWithTextPlacement,
} from "@/lib/utils";
import { useFileState } from "@/state/file-state";
import { usePagesState } from "@/state/pages-state";
import { SignaturePlacementType, type TextPosition } from "@/types/enums";
import type {
  NativeResponse,
  SignatureAppearance,
  TextPlacement,
} from "@/types/type";
import { useState } from "react";
import type React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SignerNameText } from "@/types/enums";
import { useSignatureAppearanceState } from "@/state/signature-appearance-state";
import { useTextPlacementState } from "@/state/text-placement-state";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface SignUIProps {
  onAddSignature: () => void;
}

export const SignUI: React.FC<SignUIProps> = ({ onAddSignature }) => {
  const [signMethod, setSignMethod] = useState<SignaturePlacementType>(
    SignaturePlacementType.PAGES,
  );
  const { pages, setPages } = usePagesState();
  const { file, setFile } = useFileState();
  const { appearance: signatureAppearance, updateAppearance } =
    useSignatureAppearanceState();
  const { textPlacement, updateTextPlacement } = useTextPlacementState();

  const [signatureSearchText, setSignatureSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAppearanceChange = <K extends keyof SignatureAppearance>(
    field: K,
    value: SignatureAppearance[K],
  ) => {
    updateAppearance(field, value);
  };

  const handleTextPlacementChange = <K extends keyof TextPlacement>(
    field: K,
    value: TextPlacement[K],
  ) => {
    updateTextPlacement(field, value);
  };

  const validateForm = () => {
    if (!file) {
      toast.error("Please select a file to sign");
      return false;
    }

    if (signMethod === SignaturePlacementType.PAGES && pages.length === 0) {
      toast.error("Please add at least one signature on the viewer");
      return false;
    }

    if (signMethod === SignaturePlacementType.TEXT) {
      if (!textPlacement.searchText.trim()) {
        toast.error("Please enter text to locate the signature position");
        return false;
      }

      if (!textPlacement.width || textPlacement.width < 50) {
        toast.error("Width must be at least 50px");
        return false;
      }

      if (!textPlacement.height || textPlacement.height < 30) {
        toast.error("Height must be at least 30px");
        return false;
      }

      if (!textPlacement.position) {
        toast.error("Please select a signature placement position");
        return false;
      }
    }

    return true;
  };

  const handleSignClick = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      let response: NativeResponse;
      const pdfBytes = await file!.arrayBuffer();

      switch (signMethod) {
        case SignaturePlacementType.PAGES:
          response = await signWithPages(
            pages,
            convertPdfBufferToBase64(pdfBytes),
            signatureAppearance,
          );
          break;
        case SignaturePlacementType.TEXT:
          response = await signWithTextPlacement(
            textPlacement,
            convertPdfBufferToBase64(pdfBytes),
            signatureAppearance,
          );
          break;
      }

      if (response.status === true && response.document.content) {
        setFile(convertBase64ToFile(response.document.content, "signed.pdf"));
        setPages([]);
        toast.success("Document signed successfully");
      } else {
        toast.error(response.error.message || "Error signing document");
      }
    } catch (error) {
      console.error("Error signing document:", error);
      toast.error("An unexpected error occurred while signing the document");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSignature = () => {
    if (!file) {
      toast.error("Please select a file before adding signatures");
      return;
    }
    onAddSignature();
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Signature Options</h3>

      <Tabs defaultValue="placement" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="placement">Placement</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="placement" className="space-y-1">
          <div className="my-2 flex space-x-2">
            <button
              className={`rounded-lg px-4 py-2 transition-colors ${
                signMethod === SignaturePlacementType.PAGES
                  ? "bg-[#007acc] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setSignMethod(SignaturePlacementType.PAGES)}
            >
              Add on Viewer
            </button>
            <button
              className={`rounded-lg px-4 py-2 transition-colors ${
                signMethod === SignaturePlacementType.TEXT
                  ? "bg-[#007acc] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
              onClick={() => setSignMethod(SignaturePlacementType.TEXT)}
            >
              Specify Text
            </button>
          </div>

          {signMethod === SignaturePlacementType.PAGES ? (
            <div className="space-y-2">
              <button
                className="w-full rounded-lg bg-[#007acc] px-2 py-2 text-white transition-colors hover:bg-[#0056b3] disabled:cursor-not-allowed disabled:bg-gray-400"
                onClick={handleAddSignature}
                disabled={!file}
              >
                Add Signature on Viewer
              </button>
              {pages.length > 0 && (
                <p className="text-sm text-green-600">
                  {pages.length} signature{pages.length > 1 ? "s" : ""} added
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
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
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#007acc] focus:ring-[#007acc]"
                  placeholder="Enter text near signature location"
                  onChange={(e) =>
                    handleTextPlacementChange("searchText", e.target.value)
                  }
                  value={textPlacement.searchText}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="signatureWidth"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Width (px)
                  </label>
                  <input
                    type="number"
                    id="signatureWidth"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#007acc] focus:ring-[#007acc]"
                    placeholder="Width"
                    onChange={(e) =>
                      handleTextPlacementChange(
                        "width",
                        Number.parseInt(e.target.value) || 100,
                      )
                    }
                    value={textPlacement.width ?? 100}
                    min={50}
                    max={300}
                  />
                </div>
                <div>
                  <label
                    htmlFor="signatureHeight"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    Height (px)
                  </label>
                  <input
                    type="number"
                    id="signatureHeight"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#007acc] focus:ring-[#007acc]"
                    placeholder="Height"
                    onChange={(e) =>
                      handleTextPlacementChange(
                        "height",
                        Number.parseInt(e.target.value) || 40,
                      )
                    }
                    value={textPlacement.height}
                    min={30}
                    max={200}
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="textPlacement"
                  className="mb-1 block text-sm font-medium text-gray-700"
                >
                  Signature Placement
                </label>
                <Select
                  value={textPlacement.position}
                  onValueChange={(value) =>
                    handleTextPlacementChange("position", value as TextPosition)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select placement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="above">Above Text</SelectItem>
                    <SelectItem value="below">Below Text</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-timestamp"
                  checked={signatureAppearance.showTimestamp}
                  onCheckedChange={(checked) =>
                    handleAppearanceChange("showTimestamp", checked === true)
                  }
                />
                <Label htmlFor="show-timestamp">Show Timestamp</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-validity-icon"
                  checked={signatureAppearance.showValidityIcon}
                  onCheckedChange={(checked) =>
                    handleAppearanceChange("showValidityIcon", checked === true)
                  }
                />
                <Label htmlFor="show-validity-icon">Show Validity Icon</Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="signer-name-format"
                className="text-sm font-medium"
              >
                Signer Name Format
              </Label>
              <Select
                value={signatureAppearance.signerNameText}
                onValueChange={(value) =>
                  handleAppearanceChange(
                    "signerNameText",
                    value as SignerNameText,
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SignerNameText.NAME_ONLY}>
                    Name Only
                  </SelectItem>
                  <SelectItem value={SignerNameText.SIGNED_BY_WITH_NAME}>
                    Signed by [Name]
                  </SelectItem>
                  <SelectItem value={SignerNameText.SIGNED_BY_SIGNER_NAME}>
                    Signed by Signer [Name]
                  </SelectItem>
                  <SelectItem value={SignerNameText.NONE}>None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason" className="text-sm font-medium">
                Reason
              </Label>
              <Input
                id="reason"
                placeholder="Reason for signing"
                value={signatureAppearance.reason}
                onChange={(e) =>
                  handleAppearanceChange("reason", e.target.value)
                }
                className="focus:border-[#007acc] focus:ring-[#007acc]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">
                Location
              </Label>
              <Input
                id="location"
                placeholder="Signing location"
                value={signatureAppearance.location}
                onChange={(e) =>
                  handleAppearanceChange("location", e.target.value)
                }
                className="focus:border-[#007acc] focus:ring-[#007acc]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="authorized-by" className="text-sm font-medium">
                Authorized By
              </Label>
              <Input
                id="authorized-by"
                placeholder="Who authorized this signature"
                value={signatureAppearance.authorizedBy}
                onChange={(e) =>
                  handleAppearanceChange("authorizedBy", e.target.value)
                }
                className="focus:border-[#007acc] focus:ring-[#007acc]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="custom-text" className="text-sm font-medium">
                Custom Text
              </Label>
              <Textarea
                id="custom-text"
                placeholder="Additional text to display"
                value={signatureAppearance.customText}
                onChange={(e) =>
                  handleAppearanceChange("customText", e.target.value)
                }
                className="focus:border-[#007acc] focus:ring-[#007acc]"
                rows={3}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <button
        className="flex w-full items-center justify-center rounded-lg bg-[#007acc] px-4 py-2 text-white transition-colors hover:bg-[#0056b3] disabled:cursor-not-allowed disabled:bg-gray-400"
        onClick={handleSignClick}
        disabled={isLoading || !file}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Applying Signature...
          </>
        ) : (
          "Apply Signature"
        )}
      </button>
    </div>
  );
};
