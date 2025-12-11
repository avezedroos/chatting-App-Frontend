import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./features/userSlice";
import connectionsReducer from "./features/connectionsSlice";
import messagesReducer from "./features/messagesSlice";
import chatMetaReducer from "./features/chatMetaSlice";
import uiReducer from "./features/uiSlice";

// import chatReducer from "../features/chatSlice";

const store = configureStore({
  reducer: {
    user: userReducer,
    connections: connectionsReducer,
    messages: messagesReducer,
    chatMeta: chatMetaReducer,
    ui:uiReducer,
    // chat: chatReducer,
  },
});

export default store;
