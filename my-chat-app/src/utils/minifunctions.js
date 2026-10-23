export const getMessageById = (idOrIds, messagesArray) => {
  // If array → return array of matched messages
  if (Array.isArray(idOrIds)) {
    return idOrIds
      .map(id => messagesArray.find(msg => msg._id === id))
      .filter(Boolean); // remove null/undefined
  }

  // If single ID → return single message
  return messagesArray.find(msg => msg._id === idOrIds) || null;
};


  // 15-minute check
 export const canEditMessage = (timestamp, limitMinutes = 15) => {
   const sent = new Date(timestamp).getTime();
  if (isNaN(sent)) return false;

  const LIMIT = limitMinutes * 60 * 1000; // convert minutes → ms
  const now = Date.now();

  return now - sent <= LIMIT;
};

/**
 * Converts a timestamp into a readable format:
 * - If today: shows "hh:mm AM/PM"
 * - If yesterday: shows "Yesterday"
 * - Otherwise: shows "DD/MM/YYYY"
 *
 * @param {string|Date} timestamp - The date or timestamp to format
 * @returns {string} Formatted date string
 */
export function formatTimestamp(timestamp) {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  const now = new Date();

  // Create references for today and yesterday
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Format options
  const timeOptions = { hour: "2-digit", minute: "2-digit", hour12: true };

  // Determine output
  if (date >= today) {
    // Same day
    return date.toLocaleTimeString([], timeOptions);
  } else if (date >= yesterday) {
    // Yesterday
    return "Yesterday";
  } else {
    // Older date
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
}


export const checkPinnedMode = (selectedConnections, pinnedConnections, setIsPinnedMode) => {
  if (!selectedConnections.length) {
    setIsPinnedMode(false);
    return;
  }

  const pinnedSet = new Set(pinnedConnections);

  const allSelectedArePinned = selectedConnections.every(id =>
    pinnedSet.has(id)
  );

  const anySelectedArePinned = selectedConnections.some(id =>
    pinnedSet.has(id)
  );

  // RULE 1: all selected already pinned → UNPIN MODE
  if (allSelectedArePinned) {
    setIsPinnedMode(false);
    return;
  }

  // RULE 2 + 3: none or mixed → PIN MODE
  setIsPinnedMode(true);
};
