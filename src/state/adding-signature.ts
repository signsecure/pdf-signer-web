import { create } from "zustand";

type AddSignatureState = {
  isAddingSignature: boolean;
  setIsAddingSignature: (isAddingSignature: boolean) => void;
};

export const useAddingSignatureState = create<AddSignatureState>()((set) => ({
  isAddingSignature: false,
  setIsAddingSignature: (isAddingSignature: boolean) =>
    set({ isAddingSignature }),
}));
