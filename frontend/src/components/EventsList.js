import React, { useState, useMemo } from 'react';
import Dropdown from './Dropdown';
import EditEventModal from './EditEventModal';
import EventUpdateLogs from './EventUpdateLogs';
import { formatDateInTimezone, TIMEZONE_NAMES, getUserTimezone } from '../utils/timezone';
import useEventStore from '../store/eventStore';

const EventsList = () => {
  const [viewTimezone, setViewTimezone] = useState(() => {
    const userTz = getUserTimezone();
    return TIMEZONE_NAMES[userTz] || 'Eastern Time (ET)';
  });
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const { events, currentProfile } = useEventStore();

  const filteredEvents = useMemo(() => {
    if (!currentProfile) return events;
    
    return events.filter(event => 
      event.profiles.some(profile => profile._id === currentProfile._id)
    );
  }, [events, currentProfile]);

  // Sort events by start date
  const sortedEvents = useMemo(() => {
    return [...filteredEvents].sort((a, b) => 
      new Date(a.startDate) - new Date(b.startDate)
    );
  }, [filteredEvents]);

  const getTimezoneKey = (displayName) => {
    return Object.entries(TIMEZONE_NAMES).find(([key, name]) => name === displayName)?.[0] || 'UTC';
  };

  const timezoneOptions = Object.entries(TIMEZONE_NAMES).map(([key, name]) => ({
    value: key,
    label: name
  }));

  const handleEditEvent = (event) => {
    setSelectedEvent(event);
    setShowEditModal(true);
  };

  const handleViewLogs = (event) => {
    setSelectedEvent(event);
    setShowLogsModal(true);
  };

  const formatEventDate = (date, format = 'MMM DD, YYYY') => {
    return formatDateInTimezone(date, getTimezoneKey(viewTimezone), format);
  };

  const formatEventTime = (date) => {
    return formatDateInTimezone(date, getTimezoneKey(viewTimezone), 'HH:mm');
  };

  return (
    <div className="events-section">
      <div className="events-header">
        <div>
          <h2 className="section-title">Events</h2>
          <p className="text-sm text-gray-600">View in Timezone</p>
        </div>
        
        <div className="timezone-selector">
          <label className="form-label">Timezone:</label>
          <Dropdown
            value={timezoneOptions.find(opt => opt.label === viewTimezone)}
            onChange={(option) => setViewTimezone(option.label)}
            options={timezoneOptions}
            className="timezone-dropdown"
            renderValue={(value) => value.label}
            renderOption={(option) => option.label}
          />
        </div>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="no-events">
          <div className="no-events-icon">📅</div>
          <h3>No events found</h3>
          <p className="text-gray-500">
            {currentProfile 
              ? `No events assigned to ${currentProfile.name}` 
              : 'Create your first event to get started'}
          </p>
        </div>
      ) : (
        <div className="events-list">
          {sortedEvents.map(event => (
            <div key={event._id} className="event-card">
              {/* Event Profiles */}
              <div className="event-profiles">
                {event.profiles.map(profile => (
                  <span key={profile._id} className="profile-badge">
                    {profile.name}
                  </span>
                ))}
              </div>

              {/* Event Title (if exists) */}
              {event.title && (
                <h4 className="text-lg font-semibold mb-2 text-gray-900">
                  {event.title}
                </h4>
              )}

              {/* Event Description (if exists) */}
              {event.description && (
                <p className="text-sm text-gray-600 mb-3">
                  {event.description}
                </p>
              )}

              {/* Event Dates */}
              <div className="event-dates">
                <div className="event-date">
                  <span>
                    <strong>Start:</strong> {formatEventDate(event.startDate)} at {formatEventTime(event.startDate)}
                  </span>
                </div>
                <div className="event-date">
                  <span>
                    <strong>End:</strong> {formatEventDate(event.endDate)} at {formatEventTime(event.endDate)}
                  </span>
                </div>
              </div>

              {/* Event Meta Info */}
              <div className="event-meta">
                <div className="event-timestamps">
                  <div>Created: {formatEventDate(event.createdAt, 'MMM DD, YYYY HH:mm')}</div>
                  <div>Updated: {formatEventDate(event.updatedAt, 'MMM DD, YYYY HH:mm')}</div>
                </div>
                
                <div className="event-actions">
                  <button
                    className="event-action-btn"
                    onClick={() => handleEditEvent(event)}
                  >
                    Edit
                  </button>
                  <button
                    className="event-action-btn"
                    onClick={() => handleViewLogs(event)}
                  >
                    View Logs
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Event Modal */}
      {selectedEvent && (
        <EditEventModal
          event={selectedEvent}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedEvent(null);
          }}
          userTimezone={getTimezoneKey(viewTimezone)}
        />
      )}

      {/* Event Update Logs Modal */}
      {selectedEvent && (
        <EventUpdateLogs
          event={selectedEvent}
          isOpen={showLogsModal}
          onClose={() => {
            setShowLogsModal(false);
            setSelectedEvent(null);
          }}
          userTimezone={getTimezoneKey(viewTimezone)}
        />
      )}
    </div>
  );
};

export default EventsList;