export const copyMessages = async (messages) => {
  try {
    // messages can be: a single message OR an array of messages

    let textToCopy = "";

    // If single message object
    if (!Array.isArray(messages)) {
      textToCopy = messages.text.trim();
    } 
    // If multiple messages
    else {
      textToCopy = messages
        .map(msg => msg.text.trim())
        .join("\n")
        .trim();
    }

    // Copy to clipboard (modern API)
    await navigator.clipboard.writeText(textToCopy);

    return { success: true, copiedText: textToCopy };
  } catch (err) { 
    console.error("Copy failed:", err);

    // Fallback for older browsers
    const fallback = document.createElement("textarea");
    fallback.value = textToCopy;
    document.body.appendChild(fallback);
    fallback.select();
    document.execCommand("copy");
    document.body.removeChild(fallback);

    return { success: true, copiedText: textToCopy };
  }
};
