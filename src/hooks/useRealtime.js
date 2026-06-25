import { useEffect, useRef } from 'react';
import { useAuthStore } from '../store/authStore';

/**
 * Echo singleton — initialized once via Promise chain.
 * Fixes the race condition where getEcho() returned null on first call.
 */
let echoInstance = null;
let echoPromise = null;

/**
 * Initialize Echo — returns a Promise that resolves when Echo is ready.
 * Safe to call multiple times; only initializes once.
 *
 * @returns {Promise<Echo|null>}
 */
function getEchoPromise() {
  if (echoInstance) return Promise.resolve(echoInstance);
  if (echoPromise) return echoPromise;

  const token = useAuthStore.getState().token;
  if (!token) return Promise.resolve(null);

  echoPromise = import('pusher-js')
    .then((PusherModule) =>
      import('laravel-echo').then((EchoModule) => {
        const Pusher = PusherModule.default;
        const Echo = EchoModule.default;

        window.Pusher = Pusher;

        echoInstance = new Echo({
          broadcaster: 'pusher',
          key: import.meta.env.VITE_PUSHER_APP_KEY,
          cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'ap1',
          forceTLS: true,
          authEndpoint: `${import.meta.env.VITE_API_URL || ''}/api/broadcasting/auth`,
          auth: {
            headers: { Authorization: `Bearer ${token}` },
          },
        });

        return echoInstance;
      })
    )
    .catch((err) => {
      console.warn('[useRealtime] Failed to initialize Echo:', err);
      echoPromise = null; // Reset so next call retries
      return null;
    });

  return echoPromise;
}

/**
 * useRealtime — subscribe to a private Pusher channel.
 *
 * @param {string|null} channelName  e.g. "tenant.5"
 * @param {{ [event: string]: Function }} events  e.g. { NewOrderReceived: fn }
 */
export function useRealtime(channelName, events = {}) {
  const channelRef = useRef(null);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!channelName || !token) return;

    let cancelled = false;

    const subscribe = (echo) => {
      if (!echo || cancelled) return;
      channelRef.current = echo.private(channelName);
      Object.entries(events).forEach(([event, handler]) => {
        channelRef.current.listen(event, handler);
      });
    };

    // Use Promise-based initialization — no polling needed
    getEchoPromise().then((echo) => {
      if (!cancelled) subscribe(echo);
    });

    return () => {
      cancelled = true;
      if (channelRef.current) {
        Object.keys(events).forEach((event) => {
          channelRef.current.stopListening(event);
        });
        if (echoInstance) {
          echoInstance.leave(channelName);
        }
        channelRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelName, token]);
}

/**
 * Initialize Echo singleton — call once in staff/owner layouts.
 * Returns a Promise instead of fire-and-forget.
 *
 * @returns {Promise<Echo|null>}
 */
export function initEcho() {
  return getEchoPromise();
}

/**
 * Play a notification sound.
 * Tries local file first, falls back to Web Audio API beep.
 */
export function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/notification.mp3');
    audio.volume = 0.6;
    audio.play().catch(() => {
      // Fallback: Web Audio API beep
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.5);
    });
  } catch (_) {
    // ignore
  }
}
