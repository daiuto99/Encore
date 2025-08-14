import { useRef, useCallback } from 'react';

interface TouchGestureOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  swipeThreshold?: number;
}

export function useTouchGestures({
  onSwipeLeft,
  onSwipeRight,
  swipeThreshold = 50
}: TouchGestureOptions) {
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].screenX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.changedTouches[0].screenX;
    
    const swipeDistance = touchEndX.current - touchStartX.current;
    
    if (Math.abs(swipeDistance) > swipeThreshold) {
      if (swipeDistance > 0 && onSwipeRight) {
        onSwipeRight();
      } else if (swipeDistance < 0 && onSwipeLeft) {
        onSwipeLeft();
      }
    }
  }, [onSwipeLeft, onSwipeRight, swipeThreshold]);

  return {
    onTouchStart: handleTouchStart,
    onTouchEnd: handleTouchEnd
  };
}
