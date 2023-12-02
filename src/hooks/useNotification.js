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
    // setSocket(io(import.meta.env.VITE_APP_API_BASE_URL));
    setSocket(io("https://freshmart-backend.vercel.app"));
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
