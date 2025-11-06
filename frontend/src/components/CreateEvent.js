import React, { useState } from 'react';
import MultiProfileSelector from './MultiProfileSelector';
import Dropdown from './Dropdown';
import LoadingSpinner from './LoadingSpinner';
import { eventAPI } from '../utils/api';
import { 
  TIMEZONES, 
  TIMEZONE_NAMES, 
  validateDateTimeRange,
  formatDateForInput,
  formatTimeForInput,
  getCurrentTimeInTimezone
} from '../utils/timezone';
import useEventStore from '../store/eventStore';

const CreateEvent = () => {
  const [selectedProfiles, setSelectedProfiles] = useState([]);
  const [timezone, setTimezone] = useState('Eastern Time (ET)');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('09:00');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { addEvent, setError } = useEventStore();

  // Get timezone key 
  const getTimezoneKey = (displayName) => {
    return Object.entries(TIMEZONE_NAMES).find(([key, name]) => name === displayName)?.[0] || 'UTC';
  };


  const initializeDateTime = () => {
    if (!startDate || !endDate) {
      const now = getCurrentTimeInTimezone(getTimezoneKey(timezone));
      const currentDate = formatDateForInput(now, getTimezoneKey(timezone));
      const currentTime = formatTimeForInput(now, getTimezoneKey(timezone));
      
      if (!startDate) setStartDate(currentDate);
      if (!endDate) setEndDate(currentDate);
      if (!startTime) setStartTime(currentTime);
      if (!endTime) {
        const endTimeValue = now.add(1, 'hour');
        setEndTime(formatTimeForInput(endTimeValue, getTimezoneKey(timezone)));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (selectedProfiles.length === 0) {
      newErrors.profiles = 'At least one profile must be selected';
    }

    if (!timezone) {
      newErrors.timezone = 'Timezone is required';
    }

    if (!startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!startTime) {
      newErrors.startTime = 'Start time is required';
    }

    if (!endDate) {
      newErrors.endDate = 'End date is required';
    }

    if (!endTime) {
      newErrors.endTime = 'End time is required';
    }

    if (startDate && startTime && endDate && endTime && timezone) {
      const timezoneKey = getTimezoneKey(timezone);
      if (!validateDateTimeRange(startDate, startTime, endDate, endTime, timezoneKey)) {
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

      const timezoneKey = getTimezoneKey(timezone);
      const startDateTime = `${startDate}T${startTime}:00`;
      const endDateTime = `${endDate}T${endTime}:00`;

      const eventData = {
        profiles: selectedProfiles.map(p => p._id),
        timezone: timezoneKey,
        startDate: startDateTime,
        endDate: endDateTime,
        title: title.trim(),
        description: description.trim()
      };

      const response = await eventAPI.create(eventData);
      const newEvent = response.data.data;

      addEvent(newEvent);
      
      // Reset form
      setSelectedProfiles([]);
      setStartDate('');
      setStartTime('09:00');
      setEndDate('');
      setEndTime('09:00');
      setTitle('');
      setDescription('');      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create event';
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

  return (
    <div className="create-event-section">
      <h2 className="section-title">Create Event</h2>
      
      <form onSubmit={handleSubmit}>
        {/* Profiles Selection */}
        <div className="form-group">
          <label className="form-label">Profiles</label>
          <MultiProfileSelector
            selectedProfiles={selectedProfiles}
            onSelectionChange={setSelectedProfiles}
            disabled={isSubmitting}
          />
          {errors.profiles && <div className="form-error">{errors.profiles}</div>}
        </div>

        {/* Timezone Selection */}
        <div className="form-group">
          <label className="form-label">Timezone</label>
          <Dropdown
            value={timezoneOptions.find(opt => opt.label === timezone)}
            onChange={(option) => setTimezone(option.label)}
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
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              onFocus={initializeDateTime}
              disabled={isSubmitting}
            />
            <input
              type="time"
              className={`time-input ${errors.startTime ? 'error' : ''}`}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
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
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              onFocus={initializeDateTime}
              disabled={isSubmitting}
            />
            <input
              type="time"
              className={`time-input ${errors.endTime ? 'error' : ''}`}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
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
            value={title}
            onChange={(e) => setTitle(e.target.value)}
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
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter event description..."
            rows={3}
            maxLength={1000}
            disabled={isSubmitting}
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="create-event-btn"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner size="sm" />
              Creating Event...
            </>
          ) : (
            <>
              + Create Event
            </>
          )}
        </button>

        {errors.submit && <div className="alert alert-error mt-4">{errors.submit}</div>}
      </form>
    </div>
  );
};

export default CreateEvent;