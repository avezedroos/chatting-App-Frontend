import React from 'react'
import ChatBoxheader from './ChatBoxheader';
import ActionHeader from './ActionHeader';
import { useSelector } from 'react-redux';

const HeaderSwitcher = () => {
    const isActionHeader = useSelector((state) => state.ui.selectionMode);
  return (
    <>
   {isActionHeader ? <ActionHeader /> : <ChatBoxheader />}
</>
   
  )
}

export default HeaderSwitcher
