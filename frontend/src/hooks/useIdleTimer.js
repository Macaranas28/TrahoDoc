import { useEffect, useRef, useState, useCallback } from "react";

const WARNING_AFTER_MS = 13 * 60 * 1000; // warn at 13 minutes idle (backend times out at 15)
const ACTIVITY_EVENTS = ["mousedown", "keydown", "scroll", "touchstart"];

// Purely a UX convenience — the backend's own 15-minute check is what actually
// enforces the timeout (Phase 7). This never extends or shortens the real session.
export function useIdleTimer(enabled) {
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    setShowWarning(false);
    clearTimeout(timerRef.current);
    if (enabled) {
      timerRef.current = setTimeout(() => setShowWarning(true), WARNING_AFTER_MS);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      clearTimeout(timerRef.current);
      return;
    }
    resetTimer();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, resetTimer));
    return () => {
      clearTimeout(timerRef.current);
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, resetTimer));
    };
  }, [enabled, resetTimer]);

  return { showWarning, dismissWarning: resetTimer };
}