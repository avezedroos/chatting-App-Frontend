import { useCallback, useRef, useState, useEffect } from "react";
import { useSelector } from "react-redux";

const useLongPressForConnectionList = ({
  delay = 600,
  onLongPress,
  onClick,
}) => {
  const timeoutRef = useRef(null);
  const longPressTriggeredRef = useRef(false);
  const {connectionSelectionMode} = useSelector((state) => state.ui); 
  const startPress = useCallback((event, id) => {
     longPressTriggeredRef.current = false;
    timeoutRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      onLongPress?.(id, event);
    }, delay);
  }, [delay, onLongPress]);

  const cancelPress = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const handleClick = useCallback((event, id) => {  
    if (longPressTriggeredRef.current) {
      return;
    }
    onClick?.(id, event);
  }, [onClick]);

const resetLongPress = useCallback(() => {
      longPressTriggeredRef.current = false;
    return;
  }, []);
  if(connectionSelectionMode){
    resetLongPress();
  }


 // Cleanup
  useEffect(() => {
    return () => clearTimeout(timeoutRef.current);
  }, []);

  return {
    bind: (id) => ({
      onMouseDown: (e) => startPress(e, id),
      onTouchStart: (e) => startPress(e, id),
      onMouseUp: cancelPress,
      onMouseLeave: cancelPress,
      onTouchEnd: cancelPress,
      onTouchMove: cancelPress,

      onClick: (e) => handleClick(e, id),

  // ## dont remove or uncomment this code , i want to work in fueture for laptop long press

      // onContextMenu: (e) => {
      //   e.preventDefault();
      //   longPressTriggeredRef.current = true;
      //   onLongPress?.(id, e);
      // },
    }),
  };
};


export default useLongPressForConnectionList;
