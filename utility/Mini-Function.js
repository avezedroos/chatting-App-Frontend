export function timeAgo(timestamp) {
  if (!timestamp) return "Unknown";

  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(timestamp)) / 1000);

  // 0–59 seconds → show "Just now"
  if (diffInSeconds < 60) return "Just now";

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, value] of Object.entries(intervals)) {
    const count = Math.floor(diffInSeconds / value);
    if (count >= 1) {
      if (count === 1) return `1 ${unit} ago`;
      return `${count} ${unit}s ago`;
    }
  }

  return "Just now";
}


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
