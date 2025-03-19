import { type PdfDimensions } from "@/types/type";
import { create } from "zustand";

type PdfDimensionsState = {
  dimensions: PdfDimensions;
  setDimensions: (dimensions: PdfDimensions) => void;
};

export const usePdfDimensionsState = create<PdfDimensionsState>()((set) => ({
  dimensions: {
    width: null,
    height: null,
    aspectRatio: null,
  },
  setDimensions: (dimensions: PdfDimensions) => set({ dimensions: dimensions }),
}));
