"use client";

import { SessionProvider } from "next-auth/react";
import { NotificationProvider } from "../context/NotificationContext";
import { Toaster } from "react-hot-toast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <NotificationProvider>
        {children}
        <Toaster position="top-right" />
      </NotificationProvider>
    </SessionProvider>
  );
}
