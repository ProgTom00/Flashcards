import React from "react";

interface ToastNotificationsProps {
  message: string;
  type: "success" | "error";
}

export function ToastNotifications({ message, type }: ToastNotificationsProps) {
  const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
  const textColor = type === "success" ? "text-green-800" : "text-red-800";
  const borderColor = type === "success" ? "border-green-400" : "border-red-400";

  return (
    <div className={`${bgColor} ${textColor} ${borderColor} border-l-4 p-4 rounded-r-lg`} role="alert">
      <p>{message}</p>
    </div>
  );
}
