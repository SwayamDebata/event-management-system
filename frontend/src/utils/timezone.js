import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

export const TIMEZONES = [
  'UTC',
  'America/New_York',     
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Asia/Kolkata',
  'Asia/Dubai',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland'
];

export const TIMEZONE_NAMES = {
  'UTC': 'UTC',
  'America/New_York': 'Eastern Time (ET)',
  'America/Chicago': 'Central Time (CT)',
  'America/Denver': 'Mountain Time (MT)',
  'America/Los_Angeles': 'Pacific Time (PT)',
  'Europe/London': 'Greenwich Mean Time (GMT)',
  'Europe/Paris': 'Central European Time (CET)',
  'Europe/Berlin': 'Central European Time (CET)',
  'Asia/Tokyo': 'Japan Standard Time (JST)',
  'Asia/Shanghai': 'China Standard Time (CST)',
  'Asia/Kolkata': 'India Standard Time (IST)',
  'Asia/Dubai': 'Gulf Standard Time (GST)',
  'Australia/Sydney': 'Australian Eastern Daylight Time (AEDT)',
  'Australia/Melbourne': 'Australian Eastern Daylight Time (AEDT)',
  'Pacific/Auckland': 'New Zealand Daylight Time (NZDT)'
};

/**
 * Convert a date from one timezone to another
 * @param {string|Date} date - The date to convert
 * @param {string} fromTimezone - Source timezone
 * @param {string} toTimezone - Target timezone
 * @returns {dayjs.Dayjs} Converted dayjs object
 */
export const convertTimezone = (date, fromTimezone, toTimezone) => {
  return dayjs.tz(date, fromTimezone).tz(toTimezone);
};

/**
 * Format a date for display in a specific timezone
 * @param {string|Date} date - The date to format
 * @param {string} timezone - Target timezone
 * @param {string} format - Date format (optional)
 * @returns {string} Formatted date string
 */
export const formatDateInTimezone = (date, timezone, format = 'YYYY-MM-DD HH:mm') => {
  return dayjs(date).tz(timezone).format(format);
};

/**
 * Format a date for form inputs (YYYY-MM-DD)
 * @param {string|Date} date - The date to format
 * @param {string} timezone - Target timezone
 * @returns {string} Date in YYYY-MM-DD format
 */
export const formatDateForInput = (date, timezone) => {
  return dayjs(date).tz(timezone).format('YYYY-MM-DD');
};

/**
 * Format a time for form inputs (HH:mm)
 * @param {string|Date} date - The date to format
 * @param {string} timezone - Target timezone
 * @returns {string} Time in HH:mm format
 */
export const formatTimeForInput = (date, timezone) => {
  return dayjs(date).tz(timezone).format('HH:mm');
};

/**
 * Combine date and time inputs and convert to UTC
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {string} time - Time in HH:mm format
 * @param {string} timezone - Source timezone
 * @returns {Date} UTC Date object
 */
export const combineDateTimeToUTC = (date, time, timezone) => {
  const dateTimeString = `${date} ${time}`;
  return dayjs.tz(dateTimeString, 'YYYY-MM-DD HH:mm', timezone).utc().toDate();
};

/**
 * Get the current date and time in a specific timezone
 * @param {string} timezone - Target timezone
 * @returns {dayjs.Dayjs} Current date/time in timezone
 */
export const getCurrentTimeInTimezone = (timezone) => {
  return dayjs().tz(timezone);
};

/**
 * Validate if end date/time is after start date/time
 * @param {string} startDate - Start date in YYYY-MM-DD format
 * @param {string} startTime - Start time in HH:mm format
 * @param {string} endDate - End date in YYYY-MM-DD format
 * @param {string} endTime - End time in HH:mm format
 * @param {string} timezone - Timezone for comparison
 * @returns {boolean} True if end is after start
 */
export const validateDateTimeRange = (startDate, startTime, endDate, endTime, timezone) => {
  const start = dayjs.tz(`${startDate} ${startTime}`, 'YYYY-MM-DD HH:mm', timezone);
  const end = dayjs.tz(`${endDate} ${endTime}`, 'YYYY-MM-DD HH:mm', timezone);
  
  return end.isAfter(start);
};

/**
 * Get timezone display name
 * @param {string} timezone - Timezone identifier
 * @returns {string} Display name
 */
export const getTimezoneDisplayName = (timezone) => {
  return TIMEZONE_NAMES[timezone] || timezone;
};

/**
 * Get user's local timezone
 * @returns {string} User's timezone
 */
export const getUserTimezone = () => {
  return dayjs.tz.guess();
};

/**
 * Format relative time (e.g., "2 hours ago", "in 3 days")
 * @param {string|Date} date - The date to format
 * @param {string} timezone - Target timezone
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (date, timezone) => {
  const now = dayjs().tz(timezone);
  const target = dayjs(date).tz(timezone);
  
  const diffMinutes = target.diff(now, 'minute');
  const diffHours = target.diff(now, 'hour');
  const diffDays = target.diff(now, 'day');
  
  if (Math.abs(diffMinutes) < 60) {
    if (diffMinutes === 0) return 'Now';
    return diffMinutes > 0 ? `In ${diffMinutes} minute(s)` : `${Math.abs(diffMinutes)} minute(s) ago`;
  } else if (Math.abs(diffHours) < 24) {
    return diffHours > 0 ? `In ${diffHours} hour(s)` : `${Math.abs(diffHours)} hour(s) ago`;
  } else {
    return diffDays > 0 ? `In ${diffDays} day(s)` : `${Math.abs(diffDays)} day(s) ago`;
  }
};

export default dayjs;