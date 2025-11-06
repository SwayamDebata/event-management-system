import React, { useEffect, useState } from 'react';
import CreateEvent from '../components/CreateEvent';
import EventsList from '../components/EventsList';
import Dropdown from '../components/Dropdown';
import LoadingSpinner, { LoadingOverlay } from '../components/LoadingSpinner';
import { profileAPI, eventAPI } from '../utils/api';
import { TIMEZONE_NAMES, getUserTimezone } from '../utils/timezone';
import useEventStore from '../store/eventStore';

const EventManagement = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  
  const { 
    profiles, 
    currentProfile, 
    events,
    loading,
    error,
    setProfiles, 
    setCurrentProfile, 
    setEvents,
    setLoading, 
    setError,
    clearError,
    updateProfile
  } = useEventStore();

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setInitialLoading(true);
      await Promise.all([
        loadProfiles(),
        loadEvents()
      ]);
    } catch (error) {
      setError('Failed to load initial data');
    } finally {
      setInitialLoading(false);
    }
  };

  const loadProfiles = async () => {
    try {
      const response = await profileAPI.getAll();
      const profilesData = response.data.data;
      setProfiles(profilesData);
      
      if (profilesData.length > 0 && !currentProfile) {
        setCurrentProfile(profilesData[0]);
      }
    } catch (error) {
      throw error;
    }
  };

  const loadEvents = async () => {
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data.data);
    } catch (error) {
      throw error;
    }
  };

  const handleProfileChange = async (profile) => {
    setCurrentProfile(profile);
    clearError();
  };

  const handleTimezoneChange = async (newTimezone) => {
    if (!currentProfile) return;

    try {
      setLoading(true);
      await profileAPI.updateTimezone(currentProfile._id, newTimezone);
      
      const updatedProfile = {
        ...currentProfile,
        timezone: newTimezone
      };
      
      updateProfile(updatedProfile);
      setCurrentProfile(updatedProfile);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update timezone');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentProfileTimezone = () => {
    if (!currentProfile) return getUserTimezone();
    return currentProfile.timezone || 'UTC';
  };

  const getTimezoneDisplayName = (timezoneKey) => {
    return TIMEZONE_NAMES[timezoneKey] || timezoneKey;
  };

  const timezoneOptions = Object.entries(TIMEZONE_NAMES).map(([key, name]) => ({
    value: key,
    label: name
  }));

  if (initialLoading) {
    return (
      <div className="app-container">
        <div className="container">
          <div className="flex items-center justify-center min-h-screen">
            <LoadingSpinner size="xl" text="Loading Event Management System..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="app-header">
        <div className="container">
          <h1>Event Management</h1>
          <p className="subtitle">Create and manage events across multiple timezones</p>
        </div>
      </div>

      <div className="container">
        {/* Error Display */}
        {error && (
          <div className="alert alert-error">
            {error}
            <button 
              className="ml-2 text-sm underline" 
              onClick={clearError}
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Profile Selector */}
        {profiles.length > 0 && (
          <div className="profile-selector">
            <div className="profile-selector-content">
              <label>Select current profile:</label>
              <Dropdown
                value={currentProfile}
                onChange={handleProfileChange}
                options={profiles}
                placeholder="Select profile..."
                className="profile-dropdown"
                renderValue={(value) => value ? value.name : 'Select profile...'}
                renderOption={(option) => option.name}
              />
              
              {currentProfile && (
                <>
                  <label>Timezone:</label>
                  <Dropdown
                    value={timezoneOptions.find(opt => opt.value === getCurrentProfileTimezone())}
                    onChange={(option) => handleTimezoneChange(option.value)}
                    options={timezoneOptions}
                    className="profile-dropdown"
                    renderValue={(value) => value ? value.label : 'Select timezone...'}
                    renderOption={(option) => option.label}
                  />
                </>
              )}
            </div>
            
            {currentProfile && (
              <div className="text-sm text-gray-600">
                Viewing as: <strong>{currentProfile.name}</strong>
                {' • '}
                Timezone: <strong>{getTimezoneDisplayName(getCurrentProfileTimezone())}</strong>
              </div>
            )}
          </div>
        )}

        {/* Main Content */}
        <LoadingOverlay isLoading={loading}>
          <div className="main-grid">
            {/* Create Event Section */}
            <CreateEvent />

            {/* Events List Section */}
            <EventsList />
          </div>
        </LoadingOverlay>

        {/* No Profiles State */}
        {profiles.length === 0 && !loading && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-4">Welcome to Event Management</h2>
            <p className="text-gray-600 mb-6">
              Start by creating your first profile to manage events.
            </p>
            <div className="card max-w-md mx-auto">
              <CreateEvent />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventManagement;