import React from "react";

export default function Button({
  children,
  type = "button",
  bgColor = "bg-indigo-600",
  textColor = "text-white",
  className = "",
  loading = false,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={`
        inline-flex
        items-center
        justify-center
        gap-2

        px-6
        py-3
        rounded-lg

        font-medium
        text-sm
        tracking-wide

        ${bgColor}
        ${textColor}

        shadow-sm
        transition-all
        duration-200
        ease-out

        hover:shadow-md
        hover:-translate-y-px

        active:translate-y-0
        active:shadow-sm

        focus:outline-none
        focus:ring-2
        focus:ring-indigo-500
        focus:ring-offset-2

        disabled:opacity-50
        disabled:cursor-not-allowed
        disabled:hover:shadow-sm
        disabled:hover:translate-y-0

        ${className}
      `}
      {...props}
    >
      {loading ? (
        <span className="opacity-80">Please wait...</span>
      ) : (
        children
      )}
    </button>
  );
}
