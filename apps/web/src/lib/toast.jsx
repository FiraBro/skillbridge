// src/lib/toast.jsx
import { toast } from "react-toastify";

export const showToast = (
  message,
  actionLabel = "Undo",
  onAction = () => {},
) => {
  toast(
    <div className="flex items-center justify-between w-full gap-6">
      <span className="text-[#1f1f1f]">{message}</span>
      {actionLabel && (
        <button
          className="text-[#0b57d0] font-semibold hover:underline text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onAction();
          }}
        >
          {actionLabel}
        </button>
      )}
    </div>,
  );
};
