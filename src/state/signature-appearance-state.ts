// src/state/signature-appearance-state.ts
import { create } from "zustand";
import { SignerNameText } from "@/types/enums";
import { type SignatureAppearance } from "@/types/type";

interface SignatureAppearanceState {
  appearance: SignatureAppearance;
  updateAppearance: <K extends keyof SignatureAppearance>(
    field: K,
    value: SignatureAppearance[K],
  ) => void;
  resetAppearance: () => void;
}

const defaultAppearance: SignatureAppearance = {
  showTimestamp: true,
  showValidityIcon: true,
  image: "",
  signerNameText: SignerNameText.NAME_ONLY,
  customText: "",
  reason: "",
  location: "",
  authorizedBy: "",
};

export const useSignatureAppearanceState = create<SignatureAppearanceState>(
  (set) => ({
    appearance: { ...defaultAppearance },

    updateAppearance: (field, value) =>
      set((state) => ({
        appearance: {
          ...state.appearance,
          [field]: value,
        },
      })),

    resetAppearance: () => set({ appearance: { ...defaultAppearance } }),
  }),
);
