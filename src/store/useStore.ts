import { create } from 'zustand';
import type { Stall, Sector } from '../types';

interface AppState {
    searchQuery: string;
    setSearchQuery: (query: string) => void;

    selectedCategory: string | null;
    setSelectedCategory: (category: string | null) => void;

    selectedSector: Sector | null;
    setSelectedSector: (sector: Sector | null) => void;

    selectedStall: Stall | null;
    setSelectedStall: (stall: Stall | null) => void;

    isSidebarOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;

    isDrawingMode: boolean;
    setDrawingMode: (isDrawing: boolean) => void;

    userLocation: [number, number] | null;
    setUserLocation: (location: [number, number] | null) => void;
}

export const useStore = create<AppState>((set) => ({
    searchQuery: '',
    setSearchQuery: (query) => set({ searchQuery: query }),

    selectedCategory: null,
    setSelectedCategory: (category) => set({ selectedCategory: category }),

    selectedSector: null,
    setSelectedSector: (sector) => set({ selectedSector: sector }),

    selectedStall: null,
    setSelectedStall: (stall) => set({ selectedStall: stall }),

    isSidebarOpen: false,
    setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

    isDrawingMode: false,
    setDrawingMode: (isDrawing) => set({ isDrawingMode: isDrawing }),

    userLocation: null,
    setUserLocation: (location) => set({ userLocation: location }),
}));
