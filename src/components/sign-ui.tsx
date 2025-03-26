"use client";

import {
  convertBase64ToFile,
  convertPdfBufferToBase64,
  signWithPages,
  signWithTextPlacement,
} from "@/lib/utils";
import { useFileState } from "@/state/file-state";
import { usePagesState } from "@/state/pages-state";
import {
  SignaturePlacementType,
  TextPosition,
  SignerNameText,
} from "@/types/enums";
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
import { useSignatureAppearanceState } from "@/state/signature-appearance-state";
import { useTextPlacementState } from "@/state/text-placement-state";
import { toast } from "sonner";
import {
  Loader2,
  Fingerprint,
  PenTool,
  MousePointer,
  Search,
  FileSignature,
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
        default:
          throw new Error("Invalid signature placement method");
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
    <div className="space-y-5">
      <div className="mb-4 flex items-center gap-2">
        <FileSignature className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-medium">Signature Options</h3>
      </div>

      <Tabs defaultValue="placement" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="placement" className="flex items-center gap-1.5">
            <MousePointer className="h-3.5 w-3.5" />
            <span>Placement</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-1.5">
            <PenTool className="h-3.5 w-3.5" />
            <span>Appearance</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="placement" className="mt-4 space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex flex-col items-center rounded-lg border-2 p-3 transition-all",
                signMethod === SignaturePlacementType.PAGES
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
              )}
              onClick={() => setSignMethod(SignaturePlacementType.PAGES)}
            >
              <MousePointer
                size={24}
                className={
                  signMethod === SignaturePlacementType.PAGES
                    ? "text-primary"
                    : "text-gray-500"
                }
              />
              <span className="mt-2 text-sm font-medium">Interactive</span>
              <span className="mt-1 text-xs text-gray-500">Click on PDF</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "flex flex-col items-center rounded-lg border-2 p-3 transition-all",
                signMethod === SignaturePlacementType.TEXT
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50",
              )}
              onClick={() => setSignMethod(SignaturePlacementType.TEXT)}
            >
              <Search
                size={24}
                className={
                  signMethod === SignaturePlacementType.TEXT
                    ? "text-primary"
                    : "text-gray-500"
                }
              />
              <span className="mt-2 text-sm font-medium">Text Search</span>
              <span className="mt-1 text-xs text-gray-500">Find by text</span>
            </motion.button>
          </div>

          {signMethod === SignaturePlacementType.PAGES ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-medium">
                        Interactive Placement
                      </h4>
                      <p className="mt-1 text-xs text-gray-500">
                        Click on the document to place signatures
                      </p>
                    </div>
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${pages.length > 0 ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"}`}
                    >
                      {pages.length > 0 ? pages.length : 0}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                className="w-full"
                variant="default"
                onClick={handleAddSignature}
                disabled={!file}
              >
                <MousePointer className="mr-2 h-4 w-4" />
                Place Signature on PDF
              </Button>

              {pages.length > 0 && (
                <div className="rounded-md bg-green-50 p-2 text-center text-sm text-green-700">
                  {pages.length} signature{pages.length > 1 ? "s" : ""} placed
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="signatureLocation">
                  Signature Location (text on PDF)
                </Label>
                <div className="relative">
                  <Input
                    id="signatureLocation"
                    placeholder="Enter text near signature location"
                    value={textPlacement.searchText}
                    onChange={(e) =>
                      handleTextPlacementChange("searchText", e.target.value)
                    }
                    className="pl-3 pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">
                  Enter text that appears near where you want to sign
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="signatureWidth">Width (px)</Label>
                  <Input
                    id="signatureWidth"
                    type="number"
                    placeholder="Width"
                    value={textPlacement.width ?? 100}
                    onChange={(e) =>
                      handleTextPlacementChange(
                        "width",
                        Number.parseInt(e.target.value) || 100,
                      )
                    }
                    min={50}
                    max={300}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signatureHeight">Height (px)</Label>
                  <Input
                    id="signatureHeight"
                    type="number"
                    placeholder="Height"
                    value={textPlacement.height ?? 50}
                    onChange={(e) =>
                      handleTextPlacementChange(
                        "height",
                        Number.parseInt(e.target.value) || 50,
                      )
                    }
                    min={30}
                    max={200}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Position relative to text</Label>
                <Select
                  value={textPlacement.position ?? TextPosition.BELOW}
                  onValueChange={(value) =>
                    handleTextPlacementChange("position", value as TextPosition)
                  }
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TextPosition.ABOVE}>
                      Above the text
                    </SelectItem>
                    <SelectItem value={TextPosition.BELOW}>
                      Below the text
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Gap between text and signature (px)</Label>
                <Input
                  id="signGap"
                  type="number"
                  placeholder="Sign gap"
                  value={textPlacement.gap ?? 10}
                  onChange={(e) =>
                    handleTextPlacementChange(
                      "gap",
                      Number.parseInt(e.target.value) || 10,
                    )
                  }
                />
              </div>
            </motion.div>
          )}
        </TabsContent>

        <TabsContent value="appearance" className="mt-4 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name in signature</Label>
              <Select
                value={
                  signatureAppearance.signerNameText ??
                  SignerNameText.SIGNED_BY_WITH_NAME
                }
                onValueChange={(value) =>
                  handleAppearanceChange(
                    "signerNameText",
                    value as SignerNameText,
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select name option" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={SignerNameText.SIGNED_BY_WITH_NAME}>
                    Show signed by
                  </SelectItem>
                  <SelectItem value={SignerNameText.NAME_ONLY}>
                    Show only name
                  </SelectItem>
                  <SelectItem value={SignerNameText.NONE}>
                    Don&apos;t show name
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showTimestamp"
                checked={signatureAppearance.showTimestamp}
                onCheckedChange={(checked) =>
                  handleAppearanceChange("showTimestamp", checked === true)
                }
              />
              <Label
                htmlFor="showTimestamp"
                className="cursor-pointer text-sm font-normal"
              >
                Show date in signature
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="validityIcon"
                checked={signatureAppearance.showValidityIcon}
                onCheckedChange={(checked) =>
                  handleAppearanceChange("showValidityIcon", checked === true)
                }
              />
              <Label
                htmlFor="showTimestamp"
                className="cursor-pointer text-sm font-normal"
              >
                Show validity icon
              </Label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="signReason">Reason for signing</Label>
              <Input
                id="signReason"
                placeholder="e.g. I approve this document"
                value={signatureAppearance.reason}
                onChange={(e) =>
                  handleAppearanceChange("reason", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signLocation">Location</Label>
              <Input
                id="signLocation"
                placeholder="e.g. New York, NY"
                value={signatureAppearance.location}
                onChange={(e) =>
                  handleAppearanceChange("location", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="customText">Additional text</Label>
              <Textarea
                id="customText"
                placeholder="Additional text to display"
                value={signatureAppearance.customText ?? ""}
                onChange={(e) =>
                  handleAppearanceChange("customText", e.target.value)
                }
                className="h-20 resize-none"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Button
        className="mt-8 w-full"
        onClick={handleSignClick}
        disabled={isLoading || !file}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing PDF...
          </>
        ) : (
          <>
            <Fingerprint className="mr-2 h-4 w-4" />
            Sign PDF
          </>
        )}
      </Button>
    </div>
  );
};
