// utils/inviteHelper.js

export function getInviteTokenFromURL() {
  const path = window.location.pathname; // /invite/XYZToken

  if (path.startsWith("/invite/")) {
    return path.replace("/invite/", ""); // Extract token
  }

  return null;
}

// Call this on app load
export function detectAndSaveInviteToken() {
  const token = getInviteTokenFromURL();

  if (token) {
    sessionStorage.setItem("inviteToken", token);
  }
}
