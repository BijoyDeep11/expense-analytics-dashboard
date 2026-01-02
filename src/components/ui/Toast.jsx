const Toast = ({ message }) => {
  if (!message) return null;

  return (
    <div
      className="
        fixed bottom-24 left-1/2 -translate-x-1/2 z-40
        rounded-xl
        bg-slate-900 dark:bg-slate-100
        px-4 py-3
        text-sm
        text-white dark:text-slate-900
        shadow-lg
        animate-[toastIn_0.25s_ease-out]
      "
    >
      {message}

      <style>
        {`
          @keyframes toastIn {
            from {
              opacity: 0;
              transform: translate(-50%, 10px);
            }
            to {
              opacity: 1;
              transform: translate(-50%, 0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default Toast;
