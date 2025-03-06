"use client";

import { useAddingSignatureState } from "@/state/adding-signature";
import { usePagesState } from "@/state/pages-state";
import { type SignaturePosition } from "@/types/type";
import { Page } from "react-pdf";
import SignatureBox from "./signature-box";
import { useRef, useState } from "react";
import { usePdfDimensionsState } from "@/state/pdf-dimensions-state";

type PDFPageProps = {
  pageNumber: number;
  pageWidth: number;
};

function PDFPage({ pageNumber, pageWidth }: PDFPageProps) {
  const { isAddingSignature, setIsAddingSignature } = useAddingSignatureState();
  const { pages, setPages } = usePagesState();
  const { dimensions } = usePdfDimensionsState();

  const [numberOfSignatures, setNumberOfSignatures] = useState(1);

  const pageRef = useRef<HTMLDivElement>(null);

  const getSignatureBoxes = (pageNumber: number): SignaturePosition[] => {
    return pages.find((box) => box.pageNumber === pageNumber)?.signatures ?? [];
  };

  const handlePDFClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isAddingSignature) {
      const rect = pageRef.current!.getBoundingClientRect();

      // Get the display dimensions
      const displayWidth = rect.width;
      const displayHeight = rect.height;

      // Get click coordinates relative to the displayed element
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      // Scale coordinates to match original PDF dimensions
      const scaledX = Math.round(
        (clickX / displayWidth) * (dimensions.width ?? 0),
      );
      const scaledY = Math.round(
        (clickY / displayHeight) * (dimensions.height ?? 0),
      );

      // Create a new signature object.
      const newSignature = {
        x: scaledX,
        y: scaledY,
        width: 100,
        height: 40,
        sign: numberOfSignatures,
      };

      // Check if the page already exists in the pages array.
      const pageIndex = pages.findIndex(
        (page) => page.pageNumber === pageNumber,
      );
      if (pageIndex !== -1) {
        // If the page is found, add the new signature to the existing signatures.
        const updatedPages = pages.map((page, index) => {
          if (index === pageIndex) {
            return {
              ...page,
              signatures: [...page.signatures, newSignature],
            };
          }
          return page;
        });
        setPages(updatedPages);
      } else {
        // Otherwise, add a new page entry.
        setPages([
          ...pages,
          {
            pageNumber: pageNumber,
            signatures: [newSignature],
          },
        ]);
      }

      setIsAddingSignature(false);
      setNumberOfSignatures(numberOfSignatures + 1);
    }
  };

  return (
    <div ref={pageRef}>
      <Page
        pageNumber={pageNumber}
        className={`relative`}
        renderAnnotationLayer={false}
        renderTextLayer={false}
        width={pageWidth}
        onClick={handlePDFClick}
      >
        {getSignatureBoxes(pageNumber).map((signature) => (
          <SignatureBox
            key={signature.sign}
            signature={signature}
            pageNumber={pageNumber}
          />
        ))}
      </Page>
    </div>
  );
}

export default PDFPage;
