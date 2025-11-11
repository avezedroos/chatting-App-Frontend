import React, { use, useEffect, useState } from "react";
import Login from "./pages/Login";
import { setAuthToken } from "./services/api";
import Home from "./pages/Home";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ManageRequests from "./pages/ManageRequests";

const App = () => {
  const [auth, setAuth] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  // this is 1st useeffect function to restore auth from localStorage
  useEffect(() => {
    // restore token if present
    console.log("Restoring auth from localStorage if present");
    const token = localStorage.getItem("token");
    if (token && !auth) {
      // console.log("Found token in localStorage, restoring auth", token);
      // best-effort decode username (we stored during login response)
      // but we didn't store username in localStorage to keep it simple. If you want persistence, store username too.
      setAuth({ token, username: null });
      setAuthToken(token);
      // NOTE: we rely on the Login response to set username; for persistence you can also store username in localStorage
    }
  }, []);

  const handleAuth = (data) => {
    // data: { token, username, userdata }
    setAuth(data);
    // store username for persistence
    localStorage.setItem("username", data.username);
  };

  if (!auth || !auth.username) {
    return (
      <div className="app-container">
        <Login onAuth={handleAuth} />
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Home
              username={auth.username}
              connections={auth.userdata ? auth.userdata.connections : []}
              token={auth.token}
              userdata={auth.userdata}
            />
          }
        />
        <Route path="/requests" element={<ManageRequests username={auth.username}  />}/>
        {/* You can add more routes here */}
      </Routes> 
    </Router>
    // <Home username={auth.username} connections={auth.userdata.connections} token={auth.token} userdata={auth.userdata}/>
  );
};

export default App;
