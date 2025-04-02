
/**
 * Formats a date string for use in an input field.
 * Returns a YYYY-MM-DD formatted string that can be used in date inputs.
 */
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) {
    return new Date().toISOString().split('T')[0];
  }
  
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return new Date().toISOString().split('T')[0];
    }
    return date.toISOString().split('T')[0];
  } catch (e) {
    return new Date().toISOString().split('T')[0];
  }
};

/**
 * Formats a date string for display.
 * Returns a formatted date string (e.g., "Jan 1, 2023").
 */
export const formatDateForDisplay = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  } catch (e) {
    return dateString;
  }
};
