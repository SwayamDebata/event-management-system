import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

const useEventStore = create(devtools((set, get) => ({
  // State
  profiles: [],
  events: [],
  currentProfile: null,
  selectedProfiles: [],
  loading: false,
  error: null,
  
  // Actions
  setProfiles: (profiles) => set({ profiles }),
  
  setEvents: (events) => set({ events }),
  
  setCurrentProfile: (profile) => set({ currentProfile: profile }),
  
  setSelectedProfiles: (profiles) => set({ selectedProfiles: profiles }),
  
  addProfile: (profile) => set((state) => ({
    profiles: [...state.profiles, profile]
  })),
  
  updateProfile: (updatedProfile) => set((state) => ({
    profiles: state.profiles.map(p => 
      p._id === updatedProfile._id ? updatedProfile : p
    ),
    currentProfile: state.currentProfile?._id === updatedProfile._id 
      ? updatedProfile 
      : state.currentProfile
  })),
  
  addEvent: (event) => set((state) => ({
    events: [...state.events, event]
  })),
  
  updateEvent: (updatedEvent) => set((state) => ({
    events: state.events.map(e => 
      e._id === updatedEvent._id ? updatedEvent : e
    )
  })),
  
  removeEvent: (eventId) => set((state) => ({
    events: state.events.filter(e => e._id !== eventId)
  })),
  
  setLoading: (loading) => set({ loading }),
  
  setError: (error) => set({ error }),
  
  clearError: () => set({ error: null }),
  
  getCurrentProfileEvents: () => {
    const { events, currentProfile } = get();
    if (!currentProfile) return [];
    
    return events.filter(event => 
      event.profiles.some(p => p._id === currentProfile._id)
    );
  },
  
  getProfilesById: (profileIds) => {
    const { profiles } = get();
    return profiles.filter(p => profileIds.includes(p._id));
  }
}), {
  name: 'event-store'
}));

export default useEventStore;