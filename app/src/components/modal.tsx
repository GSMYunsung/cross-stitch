import React from "react";

interface ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[1px]"
        onClick={onClose}
      />

      <div className="relative z-10 bg-black border p-6 rounded-2xl shadow-xl max-w-lg w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-2 cursor-pointer rounded-full">
            ✕
          </button>
        </div>
        <div className="flex justify-center">{children}</div>
      </div>
    </div>
  );
};
