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



