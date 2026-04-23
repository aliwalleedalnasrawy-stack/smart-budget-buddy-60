import { useEffect, useState } from 'react';
import { toast } from 'sonner';

/**
 * Tracks online/offline status and surfaces a toast when connectivity changes.
 * The actual data sync happens through Supabase mutations triggered by the UI;
 * once we're back online, useBudget's `refresh` runs on the next mount/focus.
 */
export const useOnlineStatus = () => {
  const [online, setOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      toast.success('تمت استعادة الاتصال — جاري المزامنة', { duration: 2500 });
    };
    const goOffline = () => {
      setOnline(false);
      toast.warning('وضع عدم الاتصال — البيانات محفوظة محلياً', { duration: 3000 });
    };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  return online;
};
