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
  const showPlaceholder =
    props.value === "" || props.value === undefined;

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

      <div className="relative">
        <select
          ref={ref}
          id={id}
          className={`
            w-full
            px-4
            py-3
            pr-10
            rounded-lg

            bg-white dark:bg-slate-900
            text-slate-900 dark:text-slate-100
            border
            appearance-none
            cursor-pointer

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
        >
          {/* Placeholder only when empty */}
          {showPlaceholder && (
            <option value="">
              Select
            </option>
          )}

          {options.map((option) => (
            <option
              key={option.value ?? option}
              value={option.value ?? option}
            >
              {option.label ?? option}
            </option>
          ))}
        </select>

        {/* Chevron */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400 dark:text-slate-500">
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            />
          </svg>
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
});

export default Select;
