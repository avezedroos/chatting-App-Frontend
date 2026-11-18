
import React from "react";
import "../styles/BlockUserUI.css";
import { FiTrash2 } from "react-icons/fi";
import { ImBlocked } from "react-icons/im";
import { useDispatch, useSelector } from "react-redux";
import { api } from "../services/api";
import { removeBlockedUser } from "../redux/features/userSettingsSlice";



const BlockUserUI = ({  onClearChat }) => {
 const dispatch = useDispatch();
  const selectedConnection = useSelector((state) => state.connections.selectedConnection);
const onUnblock = async ()=>{
    if(!selectedConnection) return;
     const response = await api.patch("/userSettings/unblock", { userId: selectedConnection.userId });
           if (response.data.success) {
            //  console.log("response",response)
             dispatch(
               removeBlockedUser({
                 id: selectedConnection.userId,
               })
             );
           }
}


  return (
    <div className="blockUser-overlay">
      <div className="blockUser-modal">

        <button
          className="blockUser-action blockUser-clear"
          onClick={onClearChat}
        >
         
          <FiTrash2/>
          <span>Delete chat</span>
        </button>

        <button
          className="blockUser-action blockUser-unblock"
          onClick={onUnblock}
        >
          
<ImBlocked />

          <span>Unblock</span>
        </button>

      </div>
    </div>
  );
};

export default BlockUserUI;
