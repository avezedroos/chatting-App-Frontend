import { setPulseModal } from "../features/uiSlice";
import { updatePinnedConnections } from "../features/userSettingsSlice";

/**
 * Handles pin / unpin logic for connections
 * Rules:
 * - Max 3 pins allowed
 * - Latest pin goes to top
 * - Already pinned IDs are unpinned
 */
export const pinConnectionThunk = (incomingIds) => (dispatch, getState) => {
const existingIds =
  getState()?.userSettings?.connection?.pinnedConnections ?? [];

    const result = handlePinConnection(existingIds, incomingIds)

  if (result.error) {
    // dispatch(setPulseModal(result.error))
    dispatch(setPulseModal({
          show: true,
          type: "warning",
          title: "Pin Connections",
          message: getPinErrorMessage(result.error),
        }));
    return
  }

  dispatch(updatePinnedConnections(result.ids))
  // you can call here any api to update on backend if required #API

}

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



