import { useEffect, useState } from "react";
import clsx from "clsx";

interface AlertBannerProps {
  show: boolean;
  onClose?: () => void;
  message: string;
  type?: "error" | "warning" | "success" | "info";
  autoHideDuration?: number;
}

export default function AlertBanner({
  show,
  onClose,
  message,
  type = "error",
  autoHideDuration,
}: AlertBannerProps) {
  const [bannerVisible, setBannerVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setTimeout(() => setBannerVisible(true), 10);
      if (autoHideDuration) {
        setTimeout(() => {
          setBannerVisible(false);
          onClose?.();
        }, autoHideDuration);
      }
    } else {
      setBannerVisible(false);
    }
  }, [show, autoHideDuration, onClose]);

  const getTypeStyles = () => {
    switch (type) {
      case "error":
        return "bg-red-100 text-red-700";
      case "warning":
        return "bg-yellow-100 text-yellow-700";
      case "success":
        return "bg-green-100 text-green-700";
      case "info":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-red-100 text-red-700";
    }
  };

  if (!show) return null;

  return (
    <div
      className={clsx(
        "fixed top-4 right-4 z-50 flex transform items-center justify-center transition duration-600 ease-in-out",
        bannerVisible ? "scale-100 opacity-100" : "scale-90 opacity-0",
      )}
      onClick={onClose}
    >
      <div
        className={clsx(
          "flex items-center gap-2 rounded-xl p-4",
          getTypeStyles(),
        )}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
        >
          <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4m.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2" />
        </svg>
        <p>{message}</p>
      </div>
    </div>
  );
}
