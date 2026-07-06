import { useEffect } from "react";
import { useSocket } from "../frontend/src/users/context/SocketContext.jsx";
import { clearPromptCache } from "../frontend/src/users/services/promptService.js";

export default function SocketListener() {
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handlePromptUpdated = (data) => {
      console.log("Real-time update detected from Socket.io!", data);
      clearPromptCache();
    };

    const handleReportNotification = (data) => {
      console.log("Real-time report notification!", data);
      window.dispatchEvent(new CustomEvent("promptai:force-notification-update"));
    };

    socket.on("prompt_updated", handlePromptUpdated);
    socket.on("prompt_inserted", handlePromptUpdated);
    socket.on("report_notification", handleReportNotification);

    return () => {
      socket.off("prompt_updated", handlePromptUpdated);
      socket.off("prompt_inserted", handlePromptUpdated);
      socket.off("report_notification", handleReportNotification);
    };
  }, [socket]);

  return null;
}
