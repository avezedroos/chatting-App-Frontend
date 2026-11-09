
import { setPulseModal } from "../features/uiSlice";
import { updatePinnedConnections } from "../features/userSettingsSlice";

import { api } from "../../services/api";

/**
 * Handles pin / unpin logic for connections
 * Rules:
 * - Max 3 pins allowed
 * - Latest pin goes to top
 * - Already pinned IDs are unpinned
 */

export const pinConnectionThunk = (incomingIds) => async (dispatch, getState) => {

  // Store original state before optimistic update
  const previousIds = [
    ...(getState()?.userSettings?.connection?.pinnedConnections ?? [])
  ];

  try {
    // 1. Get existing pins
    const existingIds = previousIds;

    // 2. Validate pin/unpin logic
    const result = handlePinConnection(existingIds, incomingIds);

    if (result.error) {
      dispatch(setPulseModal({
        show: true,
        type: "warning",
        title: "Pin Connections",
        message: getPinErrorMessage(result.error),
      }));
      return;
    }

    // 3. Optimistic update (Instant UI update)
    dispatch(updatePinnedConnections(result.ids));
// console.log("result.ids",result.ids)
// console.log("incomingIds",incomingIds)

    // 4. Backend API request
    const res = await api.put(
      "/userSettings/pinConnectionToggle",
      { incomingIds:incomingIds }
    );

    // 5. Check backend response
    if (res.data.success) {
      // Sync with backend response
      dispatch(updatePinnedConnections(res.data.pinnedConnections));
      return;
    }

  } catch (error) {

    // 7. Rollback if API request fails
    dispatch(updatePinnedConnections(previousIds));
    // console.error("Pin update failed:", error);
    dispatch(setPulseModal({
      show: true,
      type: "warning",
      title: "Pin Connections",
      message: error.response?.data?.message || "Unable to update pins.",
    }));
  }
};


 function handlePinConnection(existingIds = [], incomingIds = []) {
  if (!Array.isArray(incomingIds) || incomingIds.length === 0) {
    return {
      ids: existingIds,
      error: "NO_SELECTION",
    };
  }

  if (incomingIds.length > 3) {
    return {
      ids: existingIds,
      error: "MAX_SELECTION_EXCEEDED",
    };
  }

  const uniqueIncoming = [...new Set(incomingIds)];

  const alreadyPinned = uniqueIncoming.filter(id =>
    existingIds.includes(id)
  );
  const newIds = uniqueIncoming.filter(id =>
    !existingIds.includes(id)
  );

  // Only unpin case
  if (newIds.length === 0) {
    return {
      ids: existingIds.filter(id => !alreadyPinned.includes(id)),
      error: null,
    };
  }

  // Max pin limit
  if (existingIds.length + newIds.length > 3) {
    return {
      ids: existingIds,
      error: "PIN_LIMIT_REACHED",
    };
  }

  return {
    ids: [...newIds, ...existingIds],
    error: null,
  };
}

function getPinErrorMessage(code) {
  switch (code) {
    case "MAX_SELECTION_EXCEEDED":
      return "You can select maximum 3 connections at a time.";

    case "PIN_LIMIT_REACHED":
      return "You can pin only 3 connections.";

    case "NO_SELECTION":
      return "Please select at least one connection.";

    default:
      return "";
  }
}



