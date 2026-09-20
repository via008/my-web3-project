import { create } from "zustand";

export const useContractStore = create<{
    isSuccess: boolean;
    setStatus: (status: boolean) => void;
}>((set) => {
    const setStatus = (status: boolean) => set({ isSuccess: status });

    return {
        isSuccess: false,
        setStatus,
    }
});