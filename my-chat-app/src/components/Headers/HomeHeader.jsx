import React from 'react'
import { useNavigate } from 'react-router-dom';
import ThemeToggle from '../themetogglebtn';
import { useSelector } from 'react-redux';

const HomeHeader = () => {
    //redux state
  const { username } = useSelector((state) => state.user);

  const navigate = useNavigate(); // for navigation
    const stateUpdateFunction = (where) => {

    if (where === "requestsPage") {
      navigate("/requests");
    }
  }

  return (
   <div className="W-sidebar-header">
             <div className="W-user">
               <div className="W-avatar">{username.charAt(0).toUpperCase()}</div>
               <div className="W-user-info">
                 <div className="W-username">{username}</div>
                 <div className="W-status">Available</div>
               </div>
             </div>
             <div className="W-sidebar-actions">
               <button
                 className="W-Request-btn" onClick={() => { stateUpdateFunction("requestsPage") }}>
                 Request
               </button>
               <ThemeToggle />
             </div>
           </div>
);
}
export default HomeHeader
