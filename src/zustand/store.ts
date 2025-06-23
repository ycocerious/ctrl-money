import { create } from "zustand";

type State = {
  currentMonth: Date;
};

type Actions = {
  setCurrentMonth: (month: Date) => void;
};

export const useStore = create<State & Actions>((set) => ({
  currentMonth: new Date(),
  setCurrentMonth: (month: Date) => set({ currentMonth: month }),
}));
