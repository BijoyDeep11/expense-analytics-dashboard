import React, { useId } from "react";

const Select = React.forwardRef(function Select(
  {
    label,
    options = [],
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

      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={`
            w-full
            px-4
            py-3
            rounded-lg
            bg-gray-50
            text-gray-900
            border
            outline-none
            appearance-none
            cursor-pointer
            transition-all
            duration-200
            ${
              error
                ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                : "border-gray-200 focus:bg-white focus:border-black focus:ring-1 focus:ring-black"
            }
            ${className}
          `}
          {...props}
        >
          <option value="">Select</option>
          {options.map((option) => (
            <option key={option.value ?? option} value={option.value ?? option}>
              {option.label ?? option}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
          <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p className="mt-1 text-xs text-red-600 pl-1">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
