import React, { useState } from 'react';
import Modal, { ModalActions } from './Modal';
import LoadingSpinner from './LoadingSpinner';
import { eventAPI } from '../utils/api';
import { formatDateInTimezone, formatRelativeTime } from '../utils/timezone';

const EventUpdateLogs = ({ event, isOpen, onClose, userTimezone }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  React.useEffect(() => {
    if (isOpen && event) {
      fetchLogs();
    }
  }, [isOpen, event]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventAPI.getLogs(event._id, userTimezone);
      setLogs(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch update logs');
    } finally {
      setLoading(false);
    }
  };

  const formatChangeValue = (value) => {
    if (value === null || value === undefined) return 'None';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    if (Array.isArray(value)) {
      return value.map(item => item.name || item).join(', ');
    }
    if (typeof value === 'object' && value.name) return value.name;
    if (typeof value === 'string' && value.includes('T')) {
      return formatDateInTimezone(value, userTimezone, 'MMM DD, YYYY HH:mm');
    }
    return String(value);
  };

  const getChangeDescription = (log) => {
    const { changeType, changes } = log;
    const descriptions = [];

    Object.entries(changes).forEach(([field, change]) => {
      const fieldName = field.charAt(0).toUpperCase() + field.slice(1);
      const fromValue = formatChangeValue(change.from);
      const toValue = formatChangeValue(change.to);
      
      descriptions.push(`${fieldName}: "${fromValue}" → "${toValue}"`);
    });

    return descriptions.join('; ');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Event Update History"
      size="lg"
    >
      {loading ? (
        <div className="text-center py-8">
          <LoadingSpinner size="lg" text="Loading update logs..." />
        </div>
      ) : error ? (
        <div className="alert alert-error">
          {error}
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No update history yet
        </div>
      ) : (
        <div className="update-logs">
          {logs.map((log, index) => (
            <div key={log._id || index} className="log-entry">
              <div className="log-timestamp">
                {formatDateInTimezone(
                  log.timestampFormatted || log.timestamp, 
                  userTimezone, 
                  'MMM DD, YYYY at HH:mm'
                )}
                <span className="ml-2 text-xs">
                  ({formatRelativeTime(log.timestamp, userTimezone)})
                </span>
              </div>
              <div className="log-change">
                {getChangeDescription(log)}
              </div>
            </div>
          ))}
        </div>
      )}

      <ModalActions>
        <button className="btn btn-secondary" onClick={onClose}>
          Close
        </button>
      </ModalActions>
    </Modal>
  );
};

export default EventUpdateLogs;