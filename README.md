# Frontend
this is my chate application Frontend 

work flow:

states links 
where where there the state is Updates
1) [Message state ]--6 places in chatebox.jsx
 1) const handleSend = (text) => 
    (for updating local state instatnly for better ux)

  2) chatebox.jsx --at handle reconnect socket  --  socket.emit("send-message", payload, (ack) => 
   (when this event get the confirmation of server recived the msg --its for updating sent status)

  3) socket.on("receive-message", (msg) => 
  (when socket get the new massages)

  4) socket.on("messages-read", ({ sender, receiver }) => 
   (when massage read by reciver --its for updating read status)

 5) const fetchMessages = async () => 
 (when first time frontent fetched all massage from server/db directly -- or when the chatebox mount )

 6) chatebox.jsx --  socket.emit("send-message", payload, (ack) => 
   (when this event get the confirmation of server recived the msg --its for updating sent status)

(if i change an state the where there effect is happend )
1)  useAutoMarkRead({}) -- this is an function that triger read emit when screen on focus

2)  < MessageList messages={messages} currentUser={auth.username} />
(passaing mssages to massageList component)

