import { selectMessagesByUser } from "../redux/features/messagesSelectors";

// import { selectMessagesByUser } from "../redux/selectors/messageSelectors";
export const getUsernamesByIds = (connections, userIds) => {
  return userIds
    .map((id) =>
      connections.find(
        (conn) => String(conn.userId) === String(id)
      )?.username
    )
    .filter(Boolean);
}; 


export const getMessagesForSelectedUsers = (state, userIds) => {
  const connection = state.connections.connections;
  const userNames= getUsernamesByIds(connection,userIds)

  return userNames
};