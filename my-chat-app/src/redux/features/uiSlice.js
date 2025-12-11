import { createSlice } from "@reduxjs/toolkit";
// import { send } from "vite";

const initialState = {
  // Generic modal handler
  modal: {
    type: [],      // array of modal names
    position: {},  // { MODAL_NAME: { x: 100, y: 200 } }
    data: {},      // optional modal data { MODAL_NAME: {...} }
  },
  // Reply system
  isReplying: {
    id: null,
    text: null,
    sender: null,
  },
  edit: null,   // Edit system // message object being edited
  selectedMessage: [], // Selected message (for action modals)
  isScreenVisible: true,  // Page visibility
  selectionMode: false, // show/hide action header in chat box
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {

    // 🔵 Modal Actions
    openModal: (state, action) => {
      const { name, position = null, data = null } = action.payload;
      // Add modal type if not already in array
      if (!state.modal.type.includes(name)) {
        state.modal.type.push(name);
      }
      // Add position only for this modal name
      if (position) {
        state.modal.position[name] = position;
      }
      // Add data only for this modal name
      if (data) {
        state.modal.data[name] = data;
      }
    },

    closeModal: (state, action) => {
      const name = action.payload;
      state.modal.type = state.modal.type.filter((t) => t !== name);  // Remove modal type
      delete state.modal.position[name]; // Remove its position
      delete state.modal.data[name];  // Remove its data
    },

    // close all modals at once
    closeAllModals: (state) => {
      state.modal.type = [];
      state.modal.position = {};
      state.modal.data = {};
    },

    // -----------------------------
    // 🟠 Reply Actions
    // -----------------------------

    startReplying: (state, action) => {
      const { id, text, sender } = action.payload;
      state.isReplying = { id, text, sender };
    },

    stopReplying: (state) => {
      state.isReplying = { id: null, text: null, sender: null };
    },

    updateReplyingField: (state, action) => {
      const { field, value } = action.payload;
      if (state.isReplying[field] !== undefined) {
        state.isReplying[field] = value;
      }
    },

    // -----------------------------
    // 🟣 Edit Actions
    // -----------------------------

    startEdit: (state, action) => {
      console.log("Starting edit with message:", action.payload);
      state.edit = action.payload; // message object
    },

    cancelEdit: (state) => {
      state.edit = null;
    },

    //

    setIsScreenVisible: (state, action) => {
      state.isScreenVisible = action.payload;
    },

    // -----------------------------
    // 🟢 Selected message for modals
    // -----------------------------

    setSelectedMessage: (state, action) => {
      state.selectedMessage = action.payload; // message object
    },

    resetUI: (state) => {
      state.selectedMessage = [];
      state.selectionMode = false;
    },

    // -----------------------------
    // 🔴 Action Header visibility
    // -----------------------------  
    setSelectionMode: (state, action) => {
      state.selectionMode = action.payload;
    },
  },
});

export const {
  openModal,
  closeModal,
  closeAllModals,
  startReplying,
  stopReplying,
  updateReplyingField,
  startEdit,
  cancelEdit,
  setSelectedMessage,
  resetUI,
  setIsScreenVisible,
  setSelectionMode,
} = uiSlice.actions;

export default uiSlice.reducer;
