import { useState, useEffect } from 'react';

export const useDateTime = () => {
  const [dateTime, setDateTime] = useState(formatDateTime());

  function formatDateTime(date = new Date()) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setDateTime(formatDateTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return dateTime;
};