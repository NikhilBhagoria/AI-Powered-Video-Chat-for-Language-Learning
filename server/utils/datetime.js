const formatUTCDateTime = (date = new Date()) => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  };
  
  const isValidUTCDateTime = (dateString) => {
    const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
    if (!regex.test(dateString)) return false;
    
    const date = new Date(dateString.replace(' ', 'T') + 'Z');
    return date.toString() !== 'Invalid Date';
  };
  
  module.exports = {
    formatUTCDateTime,
    isValidUTCDateTime
  };