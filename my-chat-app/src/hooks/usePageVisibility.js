import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setIsScreenVisible } from "../redux/features/uiSlice";

const usePageVisibility = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Combine both visibility and focus logic
      const isVisible = document.visibilityState === "visible" && document.hasFocus();
      dispatch(setIsScreenVisible(isVisible));
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
  }, []);
};

export default usePageVisibility;
