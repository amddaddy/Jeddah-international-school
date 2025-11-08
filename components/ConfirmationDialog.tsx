
import React from 'react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | React.ReactNode;
  confirmButtonText?: string;
  cancelButtonText?: string;
  confirmButtonVariant?: 'primary' | 'danger';
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  confirmButtonVariant = 'primary',
}) => {
  if (!isOpen) {
    return null;
  }

  const confirmButtonClasses = {
    primary: 'bg-sky-600 hover:bg-sky-700 focus:ring-sky-500',
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      aria-labelledby="confirmation-dialog-title"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirmation-dialog-title" className="text-xl font-bold text-slate-800">
          {title}
        </h2>
        <div className="mt-2 text-slate-600">
          {message}
        </div>
        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
          >
            {cancelButtonText}
          </button>
          <button
            onClick={onConfirm}
            type="button"
            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${confirmButtonClasses[confirmButtonVariant]}`}
          >
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
