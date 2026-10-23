import React from "react";
import { useSelector } from "react-redux";

import ChatBoxheader from "./ChatBoxheader";
import ActionHeader from "./ActionHeader";
import HomeHeader from "./HomeHeader"; // <-- create/import this
import SelectionHeader from "./ActionHeaderConnection";

const HeaderSwitcher = ({ where }) => {
  // Hook must be at top level
  const isActionHeader = useSelector(
    (state) => state.ui.chatBoxSelectionMode
  );
const isHomeHeader = useSelector( 
    (state) => state.ui.connectionSelectionMode
  );

  // 1️⃣ ChatBox condition
  if (where === "chatBox") {
    return (
      <>
        {isActionHeader ? <ActionHeader /> : <ChatBoxheader />}
      </>
    );
  }

  // 2️⃣ Home condition
  if (where === "Home") {
    return (
      <>
      {isHomeHeader ? <SelectionHeader />:<HomeHeader /> }
      </>
    )
  }

  // 3️⃣ Fallback (optional but recommended)
  return null;
};

export default HeaderSwitcher;
