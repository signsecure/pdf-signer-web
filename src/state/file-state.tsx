import { create } from "zustand";

type FileState = {
  file: File | null;
  setFile: (file: File | null) => void;
};

export const useFileState = create<FileState>()((set) => ({
  file: null,
  setFile: (file: File | null) => set({ file: file }),
}));
