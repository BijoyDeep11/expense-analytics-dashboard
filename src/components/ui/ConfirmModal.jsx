const ConfirmModal = ({
  open,
  title = "Are you sure?",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="
          absolute inset-0
          bg-black/50 dark:bg-black/70
          backdrop-blur-sm
          transition-opacity
        "
        onClick={onCancel}
      />

      {/* Modal */}
      <div
        className="
          relative
          w-full
          max-w-md
          rounded-xl
          bg-white dark:bg-slate-900
          p-6
          border border-slate-200 dark:border-slate-800
          shadow-xl dark:shadow-none
          animate-[scaleIn_0.15s_ease-out]
        "
      >
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {title}
          </h3>

          {message && (
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        <div className="mt-6 flex gap-3">
          {/* Cancel */}
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="
              flex-1
              rounded-lg
              border
              border-slate-200 dark:border-slate-700
              bg-white dark:bg-slate-800
              px-4
              py-2.5
              text-sm
              font-medium
              text-slate-700 dark:text-slate-200
              hover:bg-slate-50 dark:hover:bg-slate-700
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {cancelText}
          </button>

          {/* Confirm (destructive) */}
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              flex-1
              rounded-lg
              bg-red-500 dark:bg-red-600
              px-4
              py-2.5
              text-sm
              font-medium
              text-white
              hover:bg-red-600 dark:hover:bg-red-500
              transition
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>

      {/* Animation keyframe */}
      <style>
        {`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.96);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}
      </style>
    </div>
  );
};

export default ConfirmModal;
