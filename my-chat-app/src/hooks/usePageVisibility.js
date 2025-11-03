import { useEffect } from "react";

const usePageVisibility = (onChange) => {
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Combine both visibility and focus logic
      const isVisible = document.visibilityState === "visible" && document.hasFocus();
      
      if (typeof onChange === "function") {
        onChange(isVisible);
      }
    };

    // Listen for both types of events
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleVisibilityChange);
    window.addEventListener("blur", handleVisibilityChange);

    // Trigger once initially
    handleVisibilityChange();

    // Cleanup on unmount
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleVisibilityChange);
      window.removeEventListener("blur", handleVisibilityChange);
    };
  }, [onChange]);
};

export default usePageVisibility;
