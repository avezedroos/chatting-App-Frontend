import { createSelector } from "@reduxjs/toolkit";

// INPUT SELECTORS
const selectConnections = (state) => state.connections.connections;
const selectPinnedIds = (state) => state.userSettings.connection.pinnedConnections;

// DERIVED ORDER
export const selectOrderedConnections = createSelector(
  [selectConnections, selectPinnedIds],
  (connections, pinnedIds) => {
    console.log("Selecting ordered connections with pinnedIds:", pinnedIds);
    if (!connections?.length) return [];

    if (!pinnedIds?.length) return connections;

    const pinnedSet = new Set(pinnedIds);

    // 1️⃣ Build pinned list (order = pinnedIds)
    const pinnedConnections = pinnedIds
      .map(id => connections.find(conn => conn.userId === id))
      .filter(Boolean);

    // 2️⃣ Build unpinned list (backend order preserved)
    const unpinnedConnections = connections.filter(
      conn => !pinnedSet.has(conn.userId)
    );

    // 3️⃣ Final UI order
    return [...pinnedConnections, ...unpinnedConnections];
  }
);
