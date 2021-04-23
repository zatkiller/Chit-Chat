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

  const myVideo = useRef();

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

  const answerCall = () => {};

  const callUser = () => {};

  const leaveCall = () => {};
};
