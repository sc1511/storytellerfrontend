import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChildProfile } from '../types';

interface ProfileStore {
  profiles: ChildProfile[];
  currentProfile: ChildProfile | null;

  // Actions
  addProfile: (profile: ChildProfile) => void;
  selectProfile: (id: string) => void;
  updateProfile: (id: string, updates: Partial<ChildProfile>) => void;
  deleteProfile: (id: string) => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profiles: [],
      currentProfile: null,

      addProfile: (profile) =>
        set((state) => ({
          profiles: [...state.profiles, profile],
          currentProfile: profile,
        })),

      selectProfile: (id) =>
        set((state) => ({
          currentProfile: state.profiles.find((p) => p.id === id) || null,
        })),

      updateProfile: (id, updates) =>
        set((state) => {
          const updatedProfiles = state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          );
          return {
            profiles: updatedProfiles,
            currentProfile:
              state.currentProfile?.id === id
                ? { ...state.currentProfile, ...updates }
                : state.currentProfile,
          };
        }),

      deleteProfile: (id) =>
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          currentProfile:
            state.currentProfile?.id === id ? null : state.currentProfile,
        })),
    }),
    {
      name: 'profile-storage',
    }
  )
);

