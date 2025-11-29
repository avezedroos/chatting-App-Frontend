import React, {useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, logoutUser } from "./redux/features/userSlice";
import { verifyAuthToken } from "./services/authService";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Home from "./pages/Home";
import ManageRequests from "./pages/ManageRequests";
import { setConnections } from "./redux/features/connectionsSlice";
import NotFound from "./pages/NotFound";
import { detectAndSaveInviteToken } from "./utils/inviteHelper";

const App = () => {
  const dispatch = useDispatch();
   const { isAuthenticated } = useSelector((state) => state.user);
    

  // this is 1st useeffect function to restore auth from sessionStorage
    useEffect(() => {
      detectAndSaveInviteToken(); // Save invite token from URL if present
    const restoreAuth = async () => {
      const result = await verifyAuthToken();

      if (result.valid) {
        // console.log("result",result.userdata)
        dispatch(setUser({isAuthenticated:true, userdata: result.userdata }));
        dispatch(setConnections(result.userdata.connections || []));
        // dispatch ()
      } else {
        dispatch(logoutUser());
      }
    };

    restoreAuth();
  }, [dispatch]);

  if (!isAuthenticated) {
    return (
      <div className="app-container">
        <Login />
      </div>
    );
  }
  return (
    <Router>
      <Routes>
        <Route path="/" element={ <Home/> }/>
        <Route path="/requests" element={<ManageRequests/>}/>
        {/* You can add more routes here */}

         {/* 404 Page */}
        <Route path="*" element={<NotFound />} />
      </Routes> 
    </Router>
  );
};

export default App;
