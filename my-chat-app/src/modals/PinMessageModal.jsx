
import React, { useEffect, useState } from 'react';
import { BsPinAngleFill } from 'react-icons/bs';
import { useDispatch, useSelector } from 'react-redux';
import { selectMessageById } from '../redux/features/messagesSelectors';
import { setscrollId } from '../redux/features/uiSlice';

const PinMessageModal = ({ data, otherUser }) => {
  const [index, setIndex] = useState(data.length - 1);
  useEffect(() => {
  setIndex(data.length - 1);
}, [data]);

useEffect(() => {
  setIndex((prev) => Math.min(prev, data.length - 1));
}, [data.length]);

  // console.log("data",data);
  // console.log("index",index,data.length - 1)


  const [direction, setDirection] = useState(-1);
  const dispatch = useDispatch();
  
  const message = useSelector((state) =>
    selectMessageById(state, otherUser, data[index]?.msgId)
);
// console.log("index",index,message)

 const onclick = () => {
  if (!message) return;

  dispatch(setscrollId(message._id));

  if (data.length <= 1) {
    setIndex(0);
    setDirection(-1);
    return;
  }

  setIndex((prev) => {
    if (prev === 0) {
      setDirection(1);
      return 1;
    }

    if (prev >= data.length - 1) {
      setDirection(-1);
      return prev - 1;
    }

    return prev + direction;
  });
};

  if (!data?.length) return null;

  return (
    <div className="pin-modal" onClick={onclick}>
      <div className="pin-modal-indicator">
        {data.map((pin, i) => (
          <span
            key={pin.msgId}
            className={`pin-indicator ${index === i ? 'active' : ''}`}
          />
        ))}
      </div>

      <BsPinAngleFill />
      <span>{message?.text || 'Message unavailable'}</span>
    </div>
  );
};

export default PinMessageModal;
