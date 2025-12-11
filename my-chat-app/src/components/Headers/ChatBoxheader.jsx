import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { timeAgo } from '../../../../utility/Mini-Function';
import { selectConnection } from '../../redux/features/connectionsSlice';

const ChatBoxheader = () => {
    const dispatch = useDispatch();
    // Redux state
    const { onlineUsers } = useSelector((state) => state.chatMeta);
    const otherUser = useSelector((state) => state.connections.selectedConnection?.username || state.connections.selectedConnection?.name);
    const otherOnline = onlineUsers.includes(otherUser);
    const CorelastSeenState = useSelector((state) => state.connections.selectedConnection?.onlineStatus?.lastSeen)
    const { typing } = useSelector((state) => state.chatMeta);

    // States
    const [lastSeenState, setLastSeenState] = useState(null);

    useEffect(() => {
        if (!CorelastSeenState) return;

        // 1) Update immediately
        setLastSeenState(timeAgo(CorelastSeenState));

        // 2) Update every 1 minute
        const interval = setInterval(() => {
            setLastSeenState(timeAgo(CorelastSeenState));
        }, 60000);

        // 3) Cleanup interval on unmount or lastSeen change
        return () => clearInterval(interval);

    }, [CorelastSeenState]);

    const onClose = () => {
        dispatch(selectConnection(null))
    };

    return (
        <div className="W-chat-header">
            <div className="W-chat-header-left">
                <button className="W-back-btn" onClick={onClose}>←</button>
                <div className="W-chat-avatar">{otherUser?.charAt(0).toUpperCase()}</div>
                <div className="W-chat-meta">
                    <div className="W-chat-name">{otherUser}</div>
                    <div className="W-chat-sub">
                        {typing.includes(otherUser) ? (
                            <span className="W-typing">{otherUser} is typing…</span>
                        ) : otherOnline ? (
                            <span className="W-online">Online</span>
                        ) : lastSeenState ? (
                            <span className="W-lastseen">Last seen: {lastSeenState}</span>
                        ) : (
                            <span className="W-offline">Offline</span>
                        )}
                    </div>
                </div>
            </div>
            {/* <div className="W-chat-header-right">You: {username}</div> */}
        </div>
    )
}

export default ChatBoxheader

