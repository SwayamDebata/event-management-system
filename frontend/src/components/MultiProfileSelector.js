import React, { useState, useRef, useEffect } from 'react';
import { profileAPI } from '../utils/api';
import useEventStore from '../store/eventStore';

const MultiProfileSelector = ({ 
  selectedProfiles = [], 
  onSelectionChange,
  disabled = false 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [newProfileName, setNewProfileName] = useState('');
  const [showAddProfile, setShowAddProfile] = useState(false);
  const dropdownRef = useRef(null);
  
  const { profiles, addProfile, setLoading, setError } = useEventStore();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddProfile(false);
        setNewProfileName('');
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredProfiles = profiles.filter(profile =>
    profile.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleProfileToggle = (profile) => {
    const isSelected = selectedProfiles.some(p => p._id === profile._id);
    
    if (isSelected) {
      onSelectionChange(selectedProfiles.filter(p => p._id !== profile._id));
    } else {
      onSelectionChange([...selectedProfiles, profile]);
    }
  };

  const handleAddProfile = async () => {
    if (!newProfileName.trim()) return;

    try {
      setLoading(true);
      const response = await profileAPI.create({ name: newProfileName.trim() });
      const newProfile = response.data.data;
      
      addProfile(newProfile);
      onSelectionChange([...selectedProfiles, newProfile]);
      
      setNewProfileName('');
      setShowAddProfile(false);
      setSearchTerm('');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create profile');
    } finally {
      setLoading(false);
    }
  };

  const getDisplayText = () => {
    if (selectedProfiles.length === 0) return 'Select profiles...';
    if (selectedProfiles.length === 1) return selectedProfiles[0].name;
    return `${selectedProfiles.length} profiles selected`;
  };

  return (
    <div className="profile-multi-select" ref={dropdownRef}>
      <div 
        className={`selected-profiles ${disabled ? 'disabled' : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span>{getDisplayText()}</span>
        <span className={`dropdown-arrow ${isOpen ? 'open' : ''}`}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>

      {isOpen && !disabled && (
        <div className="profile-dropdown-menu">
          <div className="profile-search">
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>

          <div className="profile-options">
            {filteredProfiles.map(profile => {
              const isSelected = selectedProfiles.some(p => p._id === profile._id);
              
              return (
                <div
                  key={profile._id}
                  className={`profile-option ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleProfileToggle(profile)}
                >
                  <div className={`profile-checkbox ${isSelected ? 'checked' : ''}`}>
                    {isSelected && '✓'}
                  </div>
                  <span>{profile.name}</span>
                </div>
              );
            })}

            {filteredProfiles.length === 0 && searchTerm && (
              <div className="profile-option disabled">
                No profiles found for "{searchTerm}"
              </div>
            )}
          </div>

          <div className="add-profile-option">
            {!showAddProfile ? (
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => setShowAddProfile(true)}
              >
                + Add Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  className="add-profile-input"
                  placeholder="Profile name..."
                  value={newProfileName}
                  onChange={(e) => setNewProfileName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleAddProfile();
                    }
                  }}
                  autoFocus
                />
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleAddProfile}
                  disabled={!newProfileName.trim()}
                >
                  Add
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiProfileSelector;