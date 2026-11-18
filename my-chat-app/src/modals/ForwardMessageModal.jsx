
import React from "react";
import ConnectionsList from "../components/ConnectionsList";
import { selectOrderedConnections } from "../redux/features/connectionSelectors";
import "../styles/ForwardMessageModal.css";

import { FaRegCircle, FaCheckCircle } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { LuSendHorizontal } from "react-icons/lu";

import ForwardHeader from "../components/Headers/ForwardHeader";
import { clearForwardMode, toggleForwardConnection } from "../redux/features/uiSlice";
import { addTempMessage, removeTempMessage, replaceTempMessage } from "../redux/features/messagesSlice";
import { selectConnection, updateLastMessage } from "../redux/features/connectionsSlice";
import socketService from "../services/socketService";

// import {toggleForwardConnection,} from "../redux/features/forwardSlice";

const ForwardMessageModal = () => {
  const dispatch = useDispatch();

  const selectedConnections = useSelector((state) => state.ui.selectedConnectionsForforwardMessage);
    const { username } = useSelector((state) => state.user);
    const { forwardMessages } = useSelector((state) => state.ui);
  const connections = useSelector(selectOrderedConnections);

  const toggleSelection = (userId, username) => {
    dispatch(
      toggleForwardConnection({
        userId,
        username,
      })
    );
  };

  const isSelected = (userId) => {
    return selectedConnections.some(
      (user) => user.userId?.toString() === userId?.toString()
    );
  };

 const forwardMessage = async () => {
  if (forwardMessages.length === 0 || selectedConnections.length === 0) return;

  console.log("Forwarding messages:", forwardMessages);

  for (const connection of selectedConnections) {

    console.log(`Starting forwarding to ${connection.username}`);

    for (const message of forwardMessages) {

      const result = await handleSend(
        message.text,
        connection.username,
        message.isForwarded
      );

      console.log(
        `Message sent to ${connection.username}:`,
        result
      );

      if (!result) {
        console.log("Message failed. Stopping forwarding.");
        return;
      }
    }
  }

  console.log("All forwarding tasks completed!");
  dispatch(clearForwardMode());
   dispatch(selectConnection(null))
};

  const handleSend = (text, otherUser, forwarded) => {
  return new Promise((resolve) => {
    if (!text.trim()) {
      resolve(false);
      return;
    }

    const tempId = `t-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const payload = {
      tempId,
      sender: username,
      receiver: otherUser,
      text: text.trim(),
      timestamp: null,
      status: "pending",
      replyTo: null,
      isForwarded:forwarded
    };

    dispatch(
      addTempMessage({
        userId: otherUser,
        message: { ...payload, pending: true, delivered: false },
      })
    );

    if (!socketService.isConnected()) {
      dispatch(removeTempMessage({ userId: otherUser, tempId }));
      resolve(false);
      return;
    }

    socketService.emit("send-message", payload, (ack) => {
      if (ack?.status && ack.data?._id) {
        dispatch(
          replaceTempMessage({
            userId: otherUser,
            tempId,
            newMessage: ack.data,
          })
        );

        dispatch(
          updateLastMessage({
            username: otherUser,
            message: ack.data.text,
            time: ack.data.timestamp,
            msgId: ack.data._id,
            match: false,
          })
        );

        resolve(true);
      } else {
        dispatch(removeTempMessage({ userId: otherUser, tempId }));
        resolve(false);
      }
    });
  });
};
  return (
    <div className="ForwardMessageModal W-sidebar Background-image">

      <ForwardHeader />

      <div className="ForwardMessageConnections">
        {connections.map((c, i) => {
          const selected = isSelected(c.userId);

          return (
            <div
              key={c.userId || i}
              className={`W-contact`}
              role="button"
              onClick={() =>
                toggleSelection(c.userId, c.username)
              }
            >
              <div className="W-contact-left">

                <div className="W-contact-avatar">
                  {c.avatar ? (
                    <img src={c.avatar} alt={c.username} />
                  ) : (
                    c.username?.charAt(0)
                  )}
                </div>

                <div className="W-contact-meta">
                  <div className="W-contact-name">
                    {c.username}
                  </div>
                </div>

              </div>

              <div className="W-contact-right">
                <div className="ForwardMessage-checkbox">
                  {selected ? (
                    <FaCheckCircle />
                  ) : (
                    <FaRegCircle />
                  )}
                </div>
              </div>

            </div>
          );
        })}
      </div>

     {selectedConnections.length > 0 &&  
     <div className="ForwardMessageInput">

        <div className="ForwardMessage-left">
          {
  selectedConnections.map((c, i) => {

    return (
      <div key={c.userId}>
        {c.username}
      </div>
    );
  })
}
        </div>

        <div className="ForwardMessage-right">
          <button
            disabled={selectedConnections.length === 0}
            onClick={forwardMessage}
          >
            <LuSendHorizontal />
          </button>
        </div>

      </div>}

    </div>
  );
};

export default ForwardMessageModal;
