import { create } from "zustand";
import { TextPosition } from "@/types/enums";
import { type TextPlacement } from "@/types/type";

interface TextPlacementState {
  textPlacement: TextPlacement;
  updateTextPlacement: <K extends keyof TextPlacement>(
    field: K,
    value: TextPlacement[K],
  ) => void;
  resetTextPlacement: () => void;
}

const defaultTextPlacement: TextPlacement = {
  pages: [0],
  searchText: "",
  width: 100,
  height: 100,
  position: TextPosition.BELOW,
  gap: 10,
};

export const useTextPlacementState = create<TextPlacementState>((set) => ({
  textPlacement: { ...defaultTextPlacement },

  updateTextPlacement: (field, value) =>
    set((state) => ({
      textPlacement: {
        ...state.textPlacement,
        [field]: value,
      },
    })),

  resetTextPlacement: () => set({ textPlacement: { ...defaultTextPlacement } }),
}));
