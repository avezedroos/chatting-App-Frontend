import { useCallback, useRef, useState, useEffect } from "react";

/**
 * Detects long-press or click events.
 * @param {function} onLongPress - Function to call on long press
 * @param {object} options
 * @param {number} [options.delay=600] - Duration (ms) to trigger long press
 * @param {function} [options.onClick] - Function to call on normal click
 * @param {boolean} [options.selectionMode=false] - Whether selection mode is active
 */
const useLongPress = (
  onLongPress,
  { delay = 600, onClick, selectionMode = false } = {}
) => {
  const [isLongPressed, setIsLongPressed] = useState(false);
  const [pressedId, setPressedId] = useState(null);
  const timeoutRef = useRef();
// console.log(" useLongPress is running ")
  // 🟣 Start detecting long press
  const start = useCallback(
    
    (event) => {
      console.log("start function is running")
      // console.log( "event.currentTarget.dataset",event.currentTarget.dataset)
      const messageId = event.currentTarget.dataset.id;
      setPressedId(messageId);

      timeoutRef.current = setTimeout(() => {
        onLongPress?.(messageId, event);
        setIsLongPressed(true);
      }, delay);
    },
    [onLongPress, delay]
  );

  // 🟡 Clear timeout
  const clear = useCallback(() => {
    console.log("clear function is runing")
    clearTimeout(timeoutRef.current);
  }, []);

  // 🟢 Handle normal click
  const handleClick = useCallback(
    (event) => {
      const messageId = event.currentTarget.dataset.id;
console.log("handleClick is running",  isLongPressed, selectionMode );
      // Prevent click immediately after long press
    //  if (isLongPressed) {
    //    setTimeout(() => setIsLongPressed(false), 50);
    //    return;
    //  }

      if (selectionMode) {
        onClick?.(messageId, event);
      }
    },
    [selectionMode, onClick, isLongPressed]
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return {
    isLongPressed,
    pressedId,
    eventHandlers: {
      onMouseDown: start,
      onTouchStart: start,
      onMouseUp: clear,
      onMouseLeave: clear,
      onTouchEnd: clear,
      onTouchMove: clear, // cancel if user drags/scrolls
      onClick: handleClick,
    },
  };
};

export default useLongPress;
