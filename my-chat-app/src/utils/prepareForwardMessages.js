
export const prepareForwardMessages = (messages, otherUser) => {
  const forwardMessages = [];

  // Sort messages: oldest first (without modifying original array)
  const sortedMessages = [...messages].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  );

  sortedMessages.forEach((message) => {
    // 1. Skip messages deleted for everyone
    if (message.isDeletedForEveryone) return;

    // 2. Only allow text messages
    if (message.type !== "text") return;

    // 3. Determine forwarded status
    let isForwarded = message.isForwarded;

    if (!isForwarded) {
      isForwarded = message.receiver !== otherUser;
    }

    // 4. Create a new forwarding object
    const newMessage = {
      text: message.text,
      type: "text",
      isForwarded,
    };

    // 5. Push into the new array
    forwardMessages.push(newMessage);
  });

  return forwardMessages;
};
