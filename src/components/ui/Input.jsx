import React, { useId } from "react";

const Input = React.forwardRef(function Input(
  {
    label,
    type = "text",
    error,
    className = "",
    ...props
  },
  ref
) {
  const id = useId();

  return (
    <div className="w-full space-y-1">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </label>
      )}

      <input
        ref={ref}
        id={id}
        type={type}
        className={`
          w-full
          px-4
          py-3
          rounded-lg

          bg-white dark:bg-slate-900
          text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500

          border
          transition-all
          duration-200

          ${
            error
              ? `
                border-red-500
                focus:ring-2
                focus:ring-red-500
                focus:border-red-500
              `
              : `
                border-slate-200 dark:border-slate-700
                hover:border-slate-300 dark:hover:border-slate-600
                focus:border-indigo-600 dark:focus:border-indigo-400
                focus:ring-2
                focus:ring-indigo-500 dark:focus:ring-indigo-400
              `
          }

          focus:outline-none

          disabled:bg-slate-100 dark:disabled:bg-slate-800
          disabled:cursor-not-allowed
          disabled:opacity-60

          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
