"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, pdfjs } from "react-pdf";
import { useDropzone } from "react-dropzone";
import {
  Plus,
  Menu,
  FolderDown,
  ChevronLeft,
  ChevronRight,
  Fingerprint,
  Lock,
  Unlock,
} from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { OptionsPanel } from "./options-panel";
import { FileHeader } from "./file-header";
import { useAddingSignatureState } from "@/state/adding-signature";
import { usePdfDimensionsState } from "@/state/pdf-dimensions-state";
import { useFileState } from "@/state/file-state";
import dynamic from "next/dynamic";
import UserMenu from "./user-menu";
import { cn } from "@/lib/utils";

import type { PDFDocumentProxy } from "pdfjs-dist";

const PDFPage = dynamic(() => import("./pdf-page"), { ssr: false });

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const PDFViewer = () => {
  const { isAddingSignature, setIsAddingSignature } = useAddingSignatureState();
  const { setDimensions } = usePdfDimensionsState();
  const { file, setFile } = useFileState();

  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageWidth, setPageWidth] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [toolbarVisible, setToolbarVisible] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<HTMLDivElement>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0]);
      }
    },
    [setFile],
  );

  useEffect(() => {
    const getPdfDimensions = async () => {
      if (file) {
        try {
          const pdfBuffer = await file.arrayBuffer();
          const pdf = await pdfjs.getDocument(pdfBuffer).promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1 });

          const width = viewport.width;
          const height = viewport.height;
          const aspectRatio = width / height;

          setDimensions({
            width,
            height,
            aspectRatio,
          });
        } catch (err) {
          console.log(err);
          setDimensions({ width: null, height: null, aspectRatio: null }); // Reset all on error
        }
      }
    };
    void getPdfDimensions();
  }, [file, setDimensions]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
  });

  const onDocumentLoadSuccess = ({ numPages }: PDFDocumentProxy) => {
    setNumPages(numPages);
    setCurrentPage(1);
    updatePageWidth();
  };

  const updatePageWidth = () => {
    if (containerRef.current) {
      const newWidth = containerRef.current.offsetWidth - 48; // Subtract padding
      setPageWidth(Math.min(newWidth, 700)); // Increased max width to 700px
    }
  };

  useEffect(() => {
    updatePageWidth(); // Initial call
    window.addEventListener("resize", updatePageWidth);

    return () => window.removeEventListener("resize", updatePageWidth);
  }, []);

  const handleAddSignature = () => {
    setIsAddingSignature(true);
  };

  // const goToPrevPage = () => {
  //   if (currentPage > 1) {
  //     setCurrentPage(currentPage - 1);
  //     scrollToCurrentPage();
  //   }
  // };

  // const goToNextPage = () => {
  //   if (numPages && currentPage < numPages) {
  //     setCurrentPage(currentPage + 1);
  //     scrollToCurrentPage();
  //   }
  // };

  // const scrollToCurrentPage = () => {
  //   if (viewerRef.current) {
  //     const pageElement = viewerRef.current.querySelector(
  //       `[data-page-number="${currentPage}"]`,
  //     );
  //     if (pageElement) {
  //       pageElement.scrollIntoView({ behavior: "smooth", block: "start" });
  //     }
  //   }
  // };

  // Toggle toolbar visibility on scroll
  useEffect(() => {
    if (!containerRef.current || !file) return;

    const handleScroll = () => {
      if (containerRef.current) {
        const scrollTop = containerRef.current.scrollTop;
        if (scrollTop > 50 && toolbarVisible) {
          setToolbarVisible(false);
        } else if (scrollTop <= 50 && !toolbarVisible) {
          setToolbarVisible(true);
        }
      }
    };

    containerRef.current.addEventListener("scroll", handleScroll);
    return () => {
      containerRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [file, toolbarVisible]);

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-primary">PDF Signer</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-2 rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
        </div>
        <UserMenu />
      </header>

      <div className="flex flex-1 overflow-hidden">
        {!file ? (
          <div className="flex flex-1 items-center justify-center p-4">
            <div
              {...getRootProps()}
              className={`h-[400px] w-full max-w-2xl rounded-2xl border-2 border-dashed ${
                isDragActive ? "border-primary bg-primary/5" : "border-gray-200"
              } flex cursor-pointer flex-col items-center justify-center gap-4 transition-colors duration-200`}
            >
              <input {...getInputProps()} />
              <div className="relative h-20 w-20">
                <div className="absolute left-1 top-1 h-full w-full rotate-6 transform rounded-lg bg-primary/10"></div>
                <div className="absolute left-0.5 top-0.5 h-full w-full rotate-3 transform rounded-lg bg-primary/5"></div>
                <div className="relative flex h-full w-full items-center justify-center rounded-lg border-2 border-primary/20 bg-white">
                  <FolderDown className="h-8 w-8 text-primary" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700">
                  Add your PDF
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isDragActive
                    ? "Drop your PDF here"
                    : "Drag & drop your PDF here or click to browse files"}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap gap-2 px-6">
                <div className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Fingerprint className="mr-1 h-3 w-3" /> Sign Documents
                </div>
                <div className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Lock className="mr-1 h-3 w-3" /> Encrypt Files
                </div>
                <div className="flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                  <Unlock className="mr-1 h-3 w-3" /> Decrypt PDFs
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="relative w-full flex-1 overflow-auto p-4"
            ref={containerRef}
          >
            {/* PDF navigation toolbar */}
            {/* <div
              className={cn(
                "fixed left-1/2 top-4 z-30 flex -translate-x-1/2 transform items-center gap-2 rounded-full bg-white/90 px-4 py-2 shadow-md backdrop-blur transition-all duration-300",
                toolbarVisible
                  ? "opacity-100"
                  : "pointer-events-none translate-y-[-20px] opacity-0",
              )}
            >
              <button
                onClick={goToPrevPage}
                disabled={currentPage === 1}
                className="rounded-full p-1 text-gray-700 transition-colors hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
                aria-label="Previous page"
              >
                <ChevronLeft size={20} />
              </button>
              <span className="min-w-[80px] text-center text-sm font-medium">
                {currentPage} / {numPages ?? 1}
              </span>
              <button
                onClick={goToNextPage}
                disabled={!numPages || currentPage === numPages}
                className="rounded-full p-1 text-gray-700 transition-colors hover:bg-gray-100 disabled:text-gray-300 disabled:hover:bg-transparent"
                aria-label="Next page"
              >
                <ChevronRight size={20} />
              </button>
            </div> */}

            <div ref={viewerRef} className="mx-auto max-w-4xl">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className={`flex flex-col items-center ${isAddingSignature ? "cursor-crosshair" : ""}`}
              >
                {Array.from(new Array(numPages), (el, index) => (
                  <div
                    key={`page_${index + 1}`}
                    data-page-number={index + 1}
                    className="relative mx-auto mb-8 max-w-3xl"
                    style={{ width: `${pageWidth}px` }}
                  >
                    <div className="overflow-hidden rounded-xl bg-white shadow-lg transition-all hover:shadow-xl">
                      <div className="border-b bg-primary/5 px-4 py-2">
                        <p className="text-sm font-medium text-gray-600">
                          Page {index + 1} of {numPages}
                        </p>
                      </div>
                      <PDFPage
                        pageNumber={index + 1}
                        pageWidth={pageWidth}
                        key={index}
                      />
                    </div>
                  </div>
                ))}
              </Document>
            </div>
          </div>
        )}

        <div
          className={`fixed right-0 top-16 z-20 h-[calc(100vh-4rem)] w-full max-w-full transform overflow-auto border-l border-gray-200 bg-white shadow-lg transition-transform duration-300 md:static md:right-auto md:top-auto md:block md:h-auto md:w-80 md:transform-none md:shadow-none ${
            sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          }`}
        >
          <FileHeader file={file} onChangeFile={() => setFile(null)} />
          <OptionsPanel onAddSignature={handleAddSignature} />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
