"use client";

import { useState } from "react";
import LogoutModal from "./LogoutModal";
import { useAuth } from "../context/AuthContext";

export default function LogoutButton({ 
  children, 
  className,
  title,
  onClick,
  onCancelClick
}: { 
  children: React.ReactNode; 
  className?: string;
  title?: string;
  onClick?: () => void;
  onCancelClick?: () => void;
}) {
  const [showModal, setShowModal] = useState(false);
  const { logout } = useAuth();

  return (
    <>
      <button 
        type="button" 
        className={className} 
        title={title}
        onClick={() => {
          if (onClick) onClick();
          setShowModal(true);
        }}
      >
        {children}
      </button>
      
      {showModal && (
        <LogoutModal 
          onCancel={() => {
            setShowModal(false);
            if (onCancelClick) onCancelClick();
          }}
          onConfirm={() => {
            setShowModal(false);
            logout();
          }}
        />
      )}
    </>
  );
}
