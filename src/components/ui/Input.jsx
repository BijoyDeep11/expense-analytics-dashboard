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
    <div className="w-full">
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-gray-700 mb-1 pl-1"
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
          bg-gray-50
          text-gray-900
          placeholder:text-gray-400
          border
          outline-none
          transition-all
          duration-200
          ${
            error
              ? "border-red-500 focus:ring-red-500 focus:border-red-500"
              : "border-gray-200 focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
          }
          disabled:opacity-50
          disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />

      {error && (
        <p className="mt-1 text-xs text-red-600 pl-1">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
