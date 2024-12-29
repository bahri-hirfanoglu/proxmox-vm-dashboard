import { create } from 'zustand';
import { VirtualMachine } from '@/types/vm';

interface VMStore {
  vms: VirtualMachine[];
  loading: boolean;
  error: string | null;
  setVMs: (vms: VirtualMachine[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useVMStore = create<VMStore>((set) => ({
  vms: [],
  loading: false,
  error: null,
  setVMs: (vms) => set({ vms }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
})); 