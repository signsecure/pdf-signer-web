"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { Document, pdfjs } from "react-pdf";
import { useDropzone } from "react-dropzone";
import { Plus, Menu } from "lucide-react";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { OptionsPanel } from "./options-panel";
import { FileHeader } from "./file-header";
import { useAddingSignatureState } from "@/state/adding-signature";
import { usePdfDimensionsState } from "@/state/pdf-dimensions-state";
import { useFileState } from "@/state/file-state";
import dynamic from "next/dynamic";
import UserMenu from "./user-menu";

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

  const containerRef = useRef<HTMLDivElement>(null);

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
    updatePageWidth();
  };

  const updatePageWidth = () => {
    if (containerRef.current) {
      const newWidth = containerRef.current.offsetWidth - 48; // Subtract padding
      setPageWidth(Math.min(newWidth, 600)); // Max width of 600px
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

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-semibold text-[#007acc]">PDF Signer</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="ml-2 rounded-md p-2 text-gray-500 hover:bg-gray-100 md:hidden"
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
                isDragActive
                  ? "border-[#007acc] bg-[#007acc]/5"
                  : "border-gray-200"
              } flex cursor-pointer flex-col items-center justify-center gap-4 transition-colors duration-200`}
            >
              <input {...getInputProps()} />
              <div className="relative h-20 w-20">
                <div className="absolute left-1 top-1 h-full w-full rotate-6 transform rounded-lg bg-[#007acc]/10"></div>
                <div className="absolute left-0.5 top-0.5 h-full w-full rotate-3 transform rounded-lg bg-[#007acc]/5"></div>
                <div className="relative flex h-full w-full items-center justify-center rounded-lg border-2 border-[#007acc]/20 bg-white">
                  <Plus className="h-8 w-8 text-[#007acc]" />
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-700">
                  Add a document
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {isDragActive
                    ? "Drop your PDF here"
                    : "Drag & drop your PDF here."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex-1 overflow-auto p-4" ref={containerRef}>
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              className={`flex flex-col items-center ${isAddingSignature ? "cursor-crosshair" : ""}`}
            >
              {Array.from(new Array(numPages), (el, index) => (
                <div
                  key={`page_${index + 1}`}
                  className="relative mx-auto mb-8 max-w-3xl"
                  style={{ width: `${pageWidth}px` }}
                >
                  <div className="overflow-hidden rounded-lg bg-white shadow-md">
                    <div className="border-b bg-[#007acc]/5 px-4 py-2">
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
        )}

        <div
          className={`fixed right-0 top-16 z-20 h-[calc(100vh-4rem)] w-full transform overflow-auto border-l border-gray-200 bg-white shadow-lg transition-transform duration-300 md:static md:right-auto md:top-auto md:block md:h-auto md:w-80 md:transform-none md:shadow-none ${
            sidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          }`}
        >
          <FileHeader file={file!} onChangeFile={() => setFile(null)} />
          <OptionsPanel onAddSignature={handleAddSignature} />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
