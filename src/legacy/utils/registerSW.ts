/**
 * Service Worker registration — guarded against Lovable's preview iframe.
 * Only runs in the published app, on a real top-level window, in production.
 */
const isInIframe = (() => {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
})();

const host = typeof window !== 'undefined' ? window.location.hostname : '';
const isPreviewHost =
  host.includes('id-preview--') ||
  host.includes('lovableproject.com') ||
  host.includes('lovable.app') === false && host.includes('localhost');

const isLocalhost = host === 'localhost' || host === '127.0.0.1';

export const registerServiceWorker = () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  // Always purge any existing SW inside iframes / preview / dev
  if (isInIframe || isPreviewHost || isLocalhost || import.meta.env.DEV) {
    navigator.serviceWorker.getRegistrations().then(regs => {
      regs.forEach(r => r.unregister());
    }).catch(() => {});
    return;
  }

  // Production, top-level: register
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {});
  });
};
