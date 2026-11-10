import { createSlice } from "@reduxjs/toolkit";

/**
 * 🔒 DEFAULT STATE (Frontend-owned shape)
 */
export const initialState = {

  appearance: {
    theme: "light",        // light | dark | system
    fontSize: "medium",    // small | medium | large
    language: "en",        // en | hi | mr
    compactMode: false,
  },

  preferences: {
    // autoPlayMedia: true,
    enterToSendMessage: true,
    showTypingIndicator: true,
    showReadReceipts: true,
  },

  privacy: {
    lastSeenVisibility: "everyone",
    profilePhotoVisibility: "everyone",
    statusVisibility: "connections",
    allowMessagesFrom: "everyone",
    blockedUsers: [],
  },

  connection: {
    pinnedConnections: [],
    archivedConnections: [],
    mutedConnections: [],
    clearChatOnLogout: false,
  },

  system: {
    isHydrated: false,
    lastSyncedAt: null,
    version: 1,
  },
};

/**
 * 🧠 SAFE ONE-TIME MERGE (NO DEEP MERGE AT RUNTIME)
 */
const hydrateState = (state, payload) => {
  if (!payload) return;

  Object.keys(state).forEach((key) => {
    if (payload[key] && typeof payload[key] === "object") {
      state[key] = { ...state[key], ...payload[key] };
    }
  });

  state.system.isHydrated = true;
  state.system.lastSyncedAt = Date.now();
};

const userSettingsSlice = createSlice({
  name: "userSettings",
  initialState,
  reducers: {
hydrateUserSettings: (state, action) => {
    hydrateState(state, action.payload);
  },
    /**
     * 💬 CHAT / CONNECTIONS
     */
   updatePinnedConnections(state, action) {
    state.connection.pinnedConnections = action.payload
  },

 updateBlockUser: (state, action) => {
  const { id, timestamp } = action.payload;

  const alreadyBlocked = state.privacy.blockedUsers.some(
    (user) => user.id.toString() === id.toString()
  );

  if (alreadyBlocked) return;

  state.privacy.blockedUsers.push({
    id,
    timestamp,
  });
},

removeBlockedUser: (state, action) => {
  const { id } = action.payload;

  state.privacy.blockedUsers = state.privacy.blockedUsers.filter(
    (user) => user.id.toString() !== id.toString()
  );
},


  },
});

export const {
  hydrateUserSettings,
  updatePinnedConnections,
  updateBlockUser,
  removeBlockedUser,
} = userSettingsSlice.actions;

export default userSettingsSlice.reducer;
