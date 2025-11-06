import React, { useState } from 'react';
import Modal, { ModalActions } from './Modal';
import MultiProfileSelector from './MultiProfileSelector';
import Dropdown from './Dropdown';
import LoadingSpinner from './LoadingSpinner';
import { eventAPI } from '../utils/api';
import { 
  TIMEZONES, 
  TIMEZONE_NAMES, 
  validateDateTimeRange,
  formatDateForInput,
  formatTimeForInput
} from '../utils/timezone';
import useEventStore from '../store/eventStore';

const EditEventModal = ({ event, isOpen, onClose, userTimezone }) => {
  const [formData, setFormData] = useState({
    profiles: [],
    timezone: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    title: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { profiles, updateEvent, setError } = useEventStore();

  // Initialize form data when event changes
  React.useEffect(() => {
    if (event && isOpen) {
      const timezoneKey = event.timezone;
      const displayName = TIMEZONE_NAMES[timezoneKey] || timezoneKey;
      
      setFormData({
        profiles: event.profiles || [],
        timezone: displayName,
        startDate: formatDateForInput(event.startDate, timezoneKey),
        startTime: formatTimeForInput(event.startDate, timezoneKey),
        endDate: formatDateForInput(event.endDate, timezoneKey),
        endTime: formatTimeForInput(event.endDate, timezoneKey),
        title: event.title || '',
        description: event.description || ''
      });
      setErrors({});
    }
  }, [event, isOpen]);

  const getTimezoneKey = (displayName) => {
    return Object.entries(TIMEZONE_NAMES).find(([key, name]) => name === displayName)?.[0] || 'UTC';
  };

  const validateForm = () => {
    const newErrors = {};

    if (formData.profiles.length === 0) {
      newErrors.profiles = 'At least one profile must be selected';
    }

    if (!formData.timezone) {
      newErrors.timezone = 'Timezone is required';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!formData.endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (formData.startDate && formData.startTime && formData.endDate && formData.endTime && formData.timezone) {
      const timezoneKey = getTimezoneKey(formData.timezone);
      if (!validateDateTimeRange(
        formData.startDate, 
        formData.startTime, 
        formData.endDate, 
        formData.endTime, 
        timezoneKey
      )) {
        newErrors.dateTime = 'End date and time must be after start date and time';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setErrors({});

      const timezoneKey = getTimezoneKey(formData.timezone);
      const startDateTime = `${formData.startDate}T${formData.startTime}:00`;
      const endDateTime = `${formData.endDate}T${formData.endTime}:00`;

      const updateData = {
        profiles: formData.profiles.map(p => p._id),
        timezone: timezoneKey,
        startDate: startDateTime,
        endDate: endDateTime,
        title: formData.title.trim(),
        description: formData.description.trim()
      };

      const response = await eventAPI.update(event._id, updateData);
      const updatedEvent = response.data.data;

      updateEvent(updatedEvent);
      onClose();
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update event';
      setError(errorMessage);
      setErrors({ submit: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const timezoneOptions = TIMEZONES.map(tz => ({
    value: tz,
    label: TIMEZONE_NAMES[tz]
  }));

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Event"
      size="lg"
    >
      <form onSubmit={handleSubmit}>
        {/* Profiles Selection */}
        <div className="form-group">
          <label className="form-label">Profiles</label>
          <MultiProfileSelector
            selectedProfiles={formData.profiles}
            onSelectionChange={(profiles) => handleInputChange('profiles', profiles)}
            disabled={isSubmitting}
          />
          {errors.profiles && <div className="form-error">{errors.profiles}</div>}
        </div>

        {/* Timezone Selection */}
        <div className="form-group">
          <label className="form-label">Timezone</label>
          <Dropdown
            value={timezoneOptions.find(opt => opt.label === formData.timezone)}
            onChange={(option) => handleInputChange('timezone', option.label)}
            options={timezoneOptions}
            placeholder="Select timezone..."
            disabled={isSubmitting}
            renderValue={(value) => value.label}
            renderOption={(option) => option.label}
          />
          {errors.timezone && <div className="form-error">{errors.timezone}</div>}
        </div>

        {/* Start Date & Time */}
        <div className="form-group">
          <label className="form-label">Start Date & Time</label>
          <div className="datetime-group">
            <input
              type="date"
              className={`date-input ${errors.startDate ? 'error' : ''}`}
              value={formData.startDate}
              onChange={(e) => handleInputChange('startDate', e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="time"
              className={`time-input ${errors.startTime ? 'error' : ''}`}
              value={formData.startTime}
              onChange={(e) => handleInputChange('startTime', e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {errors.startDate && <div className="form-error">{errors.startDate}</div>}
          {errors.startTime && <div className="form-error">{errors.startTime}</div>}
        </div>

        {/* End Date & Time */}
        <div className="form-group">
          <label className="form-label">End Date & Time</label>
          <div className="datetime-group">
            <input
              type="date"
              className={`date-input ${errors.endDate ? 'error' : ''}`}
              value={formData.endDate}
              onChange={(e) => handleInputChange('endDate', e.target.value)}
              disabled={isSubmitting}
            />
            <input
              type="time"
              className={`time-input ${errors.endTime ? 'error' : ''}`}
              value={formData.endTime}
              onChange={(e) => handleInputChange('endTime', e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {errors.endDate && <div className="form-error">{errors.endDate}</div>}
          {errors.endTime && <div className="form-error">{errors.endTime}</div>}
          {errors.dateTime && <div className="form-error">{errors.dateTime}</div>}
        </div>

        {/* Title (Optional) */}
        <div className="form-group">
          <label className="form-label">Title (Optional)</label>
          <input
            type="text"
            className="form-input"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="Enter event title..."
            maxLength={200}
            disabled={isSubmitting}
          />
        </div>

        {/* Description (Optional) */}
        <div className="form-group">
          <label className="form-label">Description (Optional)</label>
          <textarea
            className="form-textarea"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Enter event description..."
            rows={3}
            maxLength={1000}
            disabled={isSubmitting}
          />
        </div>

        {errors.submit && <div className="alert alert-error">{errors.submit}</div>}
      </form>

      <ModalActions>
        <button 
          type="button" 
          className="btn btn-secondary" 
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button 
          type="submit" 
          className="btn btn-primary"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Updating...
            </>
          ) : (
            'Update Event'
          )}
        </button>
      </ModalActions>
    </Modal>
  );
};

export default EditEventModal;