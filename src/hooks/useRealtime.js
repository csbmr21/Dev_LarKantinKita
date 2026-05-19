import { useEffect, useRef, useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

let echoInstance = null;

function getEcho() {
  if (echoInstance) return echoInstance;

  const token = useAuthStore.getState().token;
  if (!token) return null;

  // Dynamic import to avoid loading Pusher on pages that don't need it
  import('pusher-js').then((PusherModule) => {
    import('laravel-echo').then((EchoModule) => {
      const Pusher = PusherModule.default;
      const Echo   = EchoModule.default;

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
    });
  });

  return null;
}

/**
 * useRealtime — subscribe to a private Pusher channel
 *
 * @param {string|null} channelName  e.g. "tenant.5"
 * @param {{ [event: string]: Function }} events  e.g. { NewOrderReceived: fn }
 */
export function useRealtime(channelName, events = {}) {
  const channelRef = useRef(null);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!channelName || !token) return;

    let echo = echoInstance;

    const subscribe = (echoObj) => {
      if (!echoObj) return;
      channelRef.current = echoObj.private(channelName);
      Object.entries(events).forEach(([event, handler]) => {
        channelRef.current.listen(event, handler);
      });
    };

    if (echo) {
      subscribe(echo);
    } else {
      // Wait for Echo to initialize
      const interval = setInterval(() => {
        if (echoInstance) {
          clearInterval(interval);
          subscribe(echoInstance);
        }
      }, 500);
      return () => clearInterval(interval);
    }

    return () => {
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
 * Initialize Echo singleton — call once in staff/owner layouts
 */
export function initEcho() {
  getEcho();
}

/**
 * Play a notification sound
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
