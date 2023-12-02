import { addSetting, removeSetting } from "@redux/slice/settingSlice";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import io from "socket.io-client";

// Create a single socket instance
// const socket = io(process.env.NEXT_PUBLIC_API_SOCKET_URL);

const useNotification = () => {
  const dispatch = useDispatch();
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Use the environment variable for the socket URL
    const socketUrl = process.env.NEXT_PUBLIC_API_SOCKET_URL;
    if (socketUrl) {
      setSocket(io(socketUrl));
    } else {
      console.error("Socket URL is not defined in environment variables");
    }
  }, []);

  useEffect(() => {
    // Listen for the 'notification' event from the server
    socket?.on("notification", (notification) => {
      // Update data in real-time here
      console.log("notification", notification);
      if (notification?.option === "globalSetting") {
        dispatch(removeSetting("globalSetting"));
        const globalSettingData = {
          ...notification.globalSetting,
          name: "globalSetting",
        };
        dispatch(addSetting(globalSettingData));
      }
      if (notification?.option === "storeCustomizationSetting") {
        dispatch(removeSetting("storeCustomizationSetting"));

        const storeCustomizationSettingData = {
          ...notification.storeCustomizationSetting,
          name: "storeCustomizationSetting",
        };
        dispatch(addSetting(storeCustomizationSettingData));
      }
    });

    return () => {
      // Disconnect the socket when the component unmounts
      socket?.disconnect();
    };
  }, [socket]);

  return {
    socket, // You can still return the socket instance if needed
  };
};

export default useNotification;
