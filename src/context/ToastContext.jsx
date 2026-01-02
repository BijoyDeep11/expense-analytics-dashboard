import { createContext, useContext, useState } from "react";
import Toast from "../components/ui/Toast";

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [message, setMessage] = useState("");

  const showToast = (msg, duration = 2000) => {
    setMessage(msg);
    setTimeout(() => setMessage(""), duration);
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast message={message} />
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
