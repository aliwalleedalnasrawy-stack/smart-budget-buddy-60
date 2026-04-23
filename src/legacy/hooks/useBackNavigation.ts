import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Screen } from '../types';

/**
 * Hardware/browser back button handling.
 * - On non-root screens: pop the in-app stack (go back one screen).
 * - On the dashboard (root): require a second press within 2s to actually exit.
 */
export const useBackNavigation = (
  current: Screen,
  goBack: () => boolean, // returns true if we handled the back
  rootScreen: Screen = 'dashboard'
) => {
  const exitArmed = useRef(false);
  const exitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Seed a history entry so popstate fires on first back press
    if (typeof window === 'undefined') return;
    if (!window.history.state || window.history.state.__inApp !== true) {
      window.history.replaceState({ __inApp: true }, '');
    }
    window.history.pushState({ __inApp: true, screen: current }, '');
  }, [current]);

  useEffect(() => {
    const onPop = (_e: PopStateEvent) => {
      if (current !== rootScreen) {
        // Try to go back one screen in our app stack
        const handled = goBack();
        if (handled) {
          // re-push so the next back press triggers popstate again
          window.history.pushState({ __inApp: true, screen: current }, '');
          return;
        }
      }
      // On root: arm exit, require second press
      if (!exitArmed.current) {
        exitArmed.current = true;
        toast('اضغط مرة أخرى للخروج', { duration: 2000 });
        // re-push so we stay in-app
        window.history.pushState({ __inApp: true, screen: current }, '');
        if (exitTimer.current) clearTimeout(exitTimer.current);
        exitTimer.current = setTimeout(() => {
          exitArmed.current = false;
        }, 2000);
      } else {
        // Second press within window: actually leave
        window.history.back();
      }
    };

    window.addEventListener('popstate', onPop);
    return () => {
      window.removeEventListener('popstate', onPop);
      if (exitTimer.current) clearTimeout(exitTimer.current);
    };
  }, [current, goBack, rootScreen]);
};
