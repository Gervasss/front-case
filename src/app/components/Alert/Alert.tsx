import React, { useEffect } from "react";
import { AlertCircle, CheckCircle } from "lucide-react";
import styles from "./styles.module.css";

interface AlertProps {
  message: string;
  type?: "error" | "success";
  onClose: () => void;
}

export const Alert: React.FC<AlertProps> = ({ message, type = "error", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`${styles["alert-overlay"]} ${styles[type]}`}>
      <div className={styles["alert-content"]}>
        {type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
        <span className={styles["alert-message"]}>{message}</span>
      </div>
      <div className={styles["alert-progress-bar"]} />
    </div>
  );
};
