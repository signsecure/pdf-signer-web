"use client";

import { PDF_VIEWER_PAGE_SELECTOR } from "@/lib/constants";
import { useCallback, useEffect, useRef, useState } from "react";
import { Rnd, type RndDragCallback, type RndResizeCallback } from "react-rnd";
import type { SignaturePosition } from "@/types/type";
import { usePdfDimensionsState } from "@/state/pdf-dimensions-state";
import { usePagesState } from "@/state/pages-state";
import { Trash2 } from "lucide-react";

interface SignatureBoxProps {
  signature: SignaturePosition;
  pageNumber: number;
}

const SignatureBox = ({ signature, pageNumber }: SignatureBoxProps) => {
  const { dimensions } = usePdfDimensionsState();
  const { pages: prevPages, setPages } = usePagesState();

  const [coords, setCoords] = useState({
    X: 0,
    Y: 0,
    height: 40,
    width: 100,
  });

  // State to track whether this signature is focused (clicked)
  const [isFocused, setIsFocused] = useState(false);
  const signatureRef = useRef<HTMLDivElement>(null);

  const calculateCoords = useCallback(() => {
    const $page = document.querySelector<HTMLElement>(
      `${PDF_VIEWER_PAGE_SELECTOR}[data-page-number="${pageNumber}"]`,
    );
    if (!$page || !dimensions.width || !dimensions.height) {
      return;
    }

    const { height, width } = $page.getBoundingClientRect();

    // Scale the coordinates from PDF to viewer dimensions
    const scaledX = Math.round((signature.x / dimensions.width) * width);
    const scaledY = Math.round((signature.y / dimensions.height) * height);
    const scaledWidth = Math.round(
      (signature.width / dimensions.width) * width,
    );
    const scaledHeight = Math.round(
      (signature.height / dimensions.height) * height,
    );

    setCoords({
      X: scaledX,
      Y: scaledY,
      height: scaledHeight,
      width: scaledWidth,
    });
  }, [
    pageNumber,
    signature.x,
    signature.y,
    signature.width,
    signature.height,
    dimensions.width,
    dimensions.height,
  ]);

  useEffect(() => {
    calculateCoords();
  }, [calculateCoords]);

  useEffect(() => {
    const onResize = () => {
      calculateCoords();
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [calculateCoords]);

  // Close the delete option when clicking outside the signature box.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        signatureRef.current &&
        !signatureRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Converts the current viewer coordinates of the signature back to PDF dimensions
  const updateSignatureInPDFDimensions = (
    newX: number,
    newY: number,
    newWidth: number,
    newHeight: number,
  ) => {
    const $page = document.querySelector<HTMLElement>(
      `${PDF_VIEWER_PAGE_SELECTOR}[data-page-number="${pageNumber}"]`,
    );
    if (!$page || !dimensions.width || !dimensions.height) {
      return;
    }
    const { width, height } = $page.getBoundingClientRect();

    // Scale viewer coordinates back to original PDF dimensions.
    const pdfX = Math.round((newX / width) * dimensions.width);
    const pdfY = Math.round((newY / height) * dimensions.height);
    const pdfWidth = Math.round((newWidth / width) * dimensions.width);
    const pdfHeight = Math.round((newHeight / height) * dimensions.height);

    const calculatePages = () => {
      const pageIndex = prevPages.findIndex((p) => p.pageNumber === pageNumber);
      if (pageIndex === -1) {
        // If page is not present for some reason, we add it.
        return [
          ...prevPages,
          {
            pageNumber: pageNumber,
            signatures: [
              {
                ...signature,
                x: pdfX,
                y: pdfY,
                width: pdfWidth,
                height: pdfHeight,
              },
            ],
          },
        ];
      } else {
        const updatedPages = prevPages.map((page) => {
          if (page.pageNumber === pageNumber) {
            // Update the signature that matches sign.
            const updatedSignatures = page.signatures.map((sig) => {
              if (sig.sign === signature.sign) {
                return {
                  ...sig,
                  x: pdfX,
                  y: pdfY,
                  width: pdfWidth,
                  height: pdfHeight,
                };
              }
              return sig;
            });
            return {
              ...page,
              signatures: updatedSignatures,
            };
          }
          return page;
        });
        return updatedPages;
      }
    };

    // Update the pages state.
    setPages(calculatePages());
  };

  // Called when dragging stops
  const onDragStop: RndDragCallback = (e, d) => {
    const newX = d.x;
    const newY = d.y;
    updateSignatureInPDFDimensions(newX, newY, coords.width, coords.height);
  };

  // Called when resizing stops
  const onResizeStop: RndResizeCallback = (
    e,
    direction,
    ref,
    delta,
    position,
  ) => {
    const newWidth = ref.offsetWidth;
    const newHeight = ref.offsetHeight;
    const newX = position.x;
    const newY = position.y;
    updateSignatureInPDFDimensions(newX, newY, newWidth, newHeight);
  };

  // Handle signature deletion
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedPages = prevPages
      .map((page) => {
        if (page.pageNumber === pageNumber) {
          const updatedSignatures = page.signatures.filter(
            (sig) => sig.sign !== signature.sign,
          );
          return {
            ...page,
            signatures: updatedSignatures,
          };
        }
        return page;
      })
      .filter((page) => page.signatures.length > 0);

    setPages(updatedPages);
  };

  return (
    <Rnd
      key={coords.X + coords.Y + coords.height + coords.width}
      default={{
        x: coords.X,
        y: coords.Y,
        width: coords.width,
        height: coords.height,
      }}
      minWidth={100}
      minHeight={30}
      bounds={`${PDF_VIEWER_PAGE_SELECTOR}[data-page-number="${pageNumber}"]`}
      resizeHandleStyles={{
        bottom: { bottom: -8, cursor: "ns-resize" },
        top: { top: -8, cursor: "ns-resize" },
        left: { cursor: "ew-resize" },
        right: { cursor: "ew-resize" },
      }}
      onDragStop={onDragStop}
      onResizeStop={onResizeStop}
    >
      <div
        ref={signatureRef}
        onClick={(e) => {
          // Prevent click from propagating to parent elements.
          e.stopPropagation();
          setIsFocused(true);
        }}
        className={`relative flex h-full w-full items-center justify-center rounded border-2 bg-[#007acc]/10 transition-all ${
          isFocused ? "border-[#007acc] shadow-lg" : "border-gray-300 shadow-sm"
        }`}
      >
        {isFocused && (
          <button
            onClick={handleDelete}
            className="absolute -bottom-8 z-50 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md hover:bg-red-600 focus:outline-none"
            title="Delete signature"
          >
            <Trash2 size={14} />
          </button>
        )}
        <div
          style={{ fontSize: "clamp(0.575rem, 5vw, 1rem)" }}
          className="text-center text-[#007acc]"
        >
          Signature {signature.sign}
        </div>
      </div>
    </Rnd>
  );
};

export default SignatureBox;
