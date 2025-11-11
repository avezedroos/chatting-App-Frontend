import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
// Import Bootstrap CSS
import 'bootstrap/dist/css/bootstrap.min.css'
// Optional: Import Bootstrap JS (for modals, dropdowns, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js'

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);
