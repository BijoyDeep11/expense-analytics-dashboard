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
          className="block text-sm font-medium text-slate-700"
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

          bg-white
          text-slate-900
          placeholder:text-slate-400

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
                border-slate-200
                hover:border-slate-300
                focus:border-indigo-600
                focus:ring-2
                focus:ring-indigo-500
              `
          }

          focus:outline-none

          disabled:bg-slate-100
          disabled:cursor-not-allowed
          disabled:opacity-60

          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
