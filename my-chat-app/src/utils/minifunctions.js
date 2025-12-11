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