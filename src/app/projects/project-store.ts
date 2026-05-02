import { create } from 'zustand';

interface ProjectStore {
    searchQuery: string;
    setSearchQuery: (q: string) => void;
    statusFilter: string;
    setStatusFilter: (s: string) => void;
    ownerFilter: string;
    setOwnerFilter: (o: string) => void;
    selectedProjectId: string | null;
    setSelectedProjectId: (id: string | null) => void;
}

export const useProjectStore = create<ProjectStore>((set) => ({
    searchQuery: '',
    setSearchQuery: (q) => set({ searchQuery: q }),
    statusFilter: 'ALL',
    setStatusFilter: (s) => set({ statusFilter: s }),
    ownerFilter: '',
    setOwnerFilter: (o) => set({ ownerFilter: o }),
    selectedProjectId: null,
    setSelectedProjectId: (id) => set({ selectedProjectId: id }),
}));
