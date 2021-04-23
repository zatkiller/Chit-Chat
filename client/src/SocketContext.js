// React Context and  Socket logic all in this file, so that can be easily used by the components
import React, { createContext, useState, useRef, useEffect } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const SocketContext = createContext();

const socket = io("http://localhost:5000");

const ContextProvider = ({ children }) => {
  const [stream, setStream] = useState();
  const [call, setCall] = useState({});
  const [me, setMe] = useState("");
  const [callAccepted, setCallAccepted] = useState(false);
  const [callEnded, setCallEnded] = useState(false);
  const [name, setName] = useState("");

  const myVideo = useRef();
  const userVideo = useRef();
  const connectionRef = useRef();

  useEffect(() => {
    // Get permission to use mic and camera from the user
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);

        // Populate video frame once loaded, hence need useRef
        myVideo.current.srcObject = currentStream;
      });

    // Listen from the me action on the backend
    socket.on("me", (id) => setMe(id));

    socket.on("callUser", ({ from, name: callerName, signal }) => {
      setCall({ isReceivingCall: true, from, name: callerName, signal });
    });
  }, []);

  const answerCall = () => {
    setCallAccepted(true);

    // Initiator - person who created the call
    //
    const peer = new Peer({ initiator: false, trickle: false, stream });

    // receive the signal, similar to socket on connection
    // to - the person callng
    peer.on("signal", (data) => {
      socket.emit("answerCall", { signal: data, to: call.from });
    });

    // start the stream on both videos
    peer.on("stream", (currentStream) => {
      // Set the other person stream
      userVideo.current.srcObject = currentStream;
    });

    //call.signal comes from socket, pass the state to peer
    peer.signal(call.signal);

    // current connection = the perr connection
    connectionRef.current = peer;
  };

  const callUser = (id) => {
    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        userToCall: id,
        signalData: data, //Pass the signal datra
        from: me,
        name,
      });
    });

    peer.on("stream", (currentStream) => {
      userVideo.current.srcObject = currentStream;
    });

    // Accept the call
    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);

      peer.signal(signal);
    });

    connectionRef.current = peer;
  };

  const leaveCall = () => {
    setCallEnded(true);

    connectionRef.current.destroy();

    // reload the page to provide new id to the user
    window.location.reload();
  };

  // All the variables inside the value will be globally accessbile to all components
  // Context only has 1 thing of it, children
  return (
    <SocketContext.Provider
      value={{
        call,
        callAccepted,
        myVideo,
        userVideo,
        stream,
        name,
        setName,
        callEnded,
        me,
        callUser,
        leaveCall,
        answerCall,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export { ContextProvider, SocketContext };
