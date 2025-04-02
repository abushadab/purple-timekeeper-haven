
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
