import { type SignaturesOnPage } from "@/types/type";
import { create } from "zustand";

type PagesStates = {
  pages: SignaturesOnPage[];
  setPages: (pages: SignaturesOnPage[]) => void;
};

export const usePagesState = create<PagesStates>()((set) => ({
  pages: [],
  setPages: (pages: SignaturesOnPage[]) => set({ pages: pages }),
}));
