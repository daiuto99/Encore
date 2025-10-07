import { useRef, useCallback } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
}

export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 100  // Increased from 50 to 100
}: TouchGestureOptions) {
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchEndX = useRef(0);
  const touchEndY = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
    touchStartY.current = e.changedTouches[0].screenY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    touchEndY.current = e.changedTouches[0].screenY;
    
    const swipeDistanceX = touchEndX.current - touchStartX.current;
    const swipeDistanceY = Math.abs(touchEndY.current - touchStartY.current);
    
    // Only trigger if horizontal swipe is larger than vertical swipe
    // This prevents accidental swipes while scrolling
    if (Math.abs(swipeDistanceX) > swipeThreshold && Math.abs(swipeDistanceX) > swipeDistanceY * 2) {
      if (swipeDistanceX > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (swipeDistanceX < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  }, [onSwipeLeft, onSwipeRight, swipeThreshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
}
