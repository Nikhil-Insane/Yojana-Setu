import { useState, useEffect } from 'react';

/**
 * useOnlineStatus — Custom React hook to detect online/offline connectivity.
 * 
 * - AI features (Gemini API calls) require: online = true
 * - Offline features (Scheme finder form, EMI calculator, profile, doc checklist): always available
 */
export default function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const goOnline  = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online',  goOnline);
    window.addEventListener('offline', goOffline);

    return () => {
      window.removeEventListener('online',  goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return isOnline;
}
