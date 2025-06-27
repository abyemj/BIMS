// utils/dateUtils.ts
import { format, parse } from 'date-fns';

/**
 * Safely parses dates from Appwrite with fallback
 */
export const parseAppwriteDate = (dateString: string): Date => {
  try {
    // Remove timezone offset if present to prevent parsing issues
    const normalizedDate = dateString.split('+')[0].split('.')[0];
    const date = new Date(normalizedDate);
    
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date');
    }
    return date;
  } catch (error) {
    console.warn('Invalid date, falling back to current date:', dateString);
    return new Date(); // Fallback to current date
  }
};

/**
 * Formats meeting date and time for display
 */
export const formatMeetingDateTime = (date: Date, timeString: string): string => {
  try {
    // Parse time (HH:mm format)
    const [hours, minutes] = timeString.split(':').map(Number);
    const timeDate = new Date(date);
    timeDate.setHours(hours, minutes);
    
    return `${format(date, 'PPP')} at ${format(timeDate, 'h:mm a')}`;
  } catch (error) {
    console.warn('Error formatting meeting time:', error);
    // Fallback formats
    return `${date.toLocaleDateString()} at ${timeString}`;
  }
};

/**
 * Converts Date to Appwrite-compatible string
 */
export const toAppwriteDate = (date: Date): string => {
  return date.toISOString();
};