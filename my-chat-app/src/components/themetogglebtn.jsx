import { useContext } from "react";
import { ThemeContext } from "../theme/ThemeProvider";
import { FiMoon } from "react-icons/fi";
import { BsMoonFill } from "react-icons/bs";





const ThemeToggle = () => {
  const { theme, setTheme } = useContext(ThemeContext);

  return (
    <div
      className=" gradient-icon ms-2 btn-sm btn-outline-light"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {/* {theme === "dark" ? "🌞" : "🌙"} */}
      <BsMoonFill
  size={25}
 className="gradient-icon"
/>
    </div>
  );
};

export default ThemeToggle;
