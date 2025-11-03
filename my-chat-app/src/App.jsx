import React, { useEffect, useState } from "react";
import Login from "./pages/Login";
import ChatBox from "./components/ChatBox";
import { setAuthToken } from "./services/api";

const App = () => {
  const [auth, setAuth] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    // restore token if present
    console.log("Restoring auth from localStorage if present");
    const token = localStorage.getItem("token");
    if (token && !auth) {
      console.log("Found token in localStorage, restoring auth", token);
      // best-effort decode username (we stored during login response)
      // but we didn't store username in localStorage to keep it simple. If you want persistence, store username too.
      setAuth({ token, username: null });
      setAuthToken(token);
      // NOTE: we rely on the Login response to set username; for persistence you can also store username in localStorage
    }
  }, []);

  const handleAuth = (data) => {
    // data: { token, username, avatar }
    setAuth(data);
    // store username for persistence
    localStorage.setItem("username", data.username);
  };

  // For two-person chat, allow user to choose the other person
  useEffect(() => {
    console.log("Setting other user if not set");
    // if user logged in, pick the other user automatically (simple approach)
    const me = localStorage.getItem("username") || auth?.username;
    if (me) {
      console.log("Current user:", me);
      // simple rule: if username is UserA -> otherUser=UserB, vice versa
      if (!otherUser) {
        const other = me.toLowerCase().includes("avez") ? "arhaan" : (me.toLowerCase().includes("arhaan") ? "avez" : "arhaan");
        setOtherUser(other);
      }
    }
    // set token default header
    if (auth?.token) setAuthToken(auth.token);
      console.log("auth set with token only", auth);
    
  }, [auth, otherUser]);

  if (!auth || !auth.username) {
    return (
      <div className="app-container">
        <Login onAuth={handleAuth} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div style={{width:"100%",maxWidth:900}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <h2>Two-Person Chat</h2>
          <div style={{display:"flex",gap:8}}>
            <button onClick={()=>{ localStorage.clear(); setAuth(null); setOtherUser(null); setAuthToken(null); }} style={{padding:"6px 10px"}}>Logout</button>
          </div>
        </div>

        <ChatBox auth={auth} otherUser={otherUser} />
      </div>
    </div>
  );
};

export default App;
