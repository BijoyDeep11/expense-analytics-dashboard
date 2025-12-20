import React from "react";

export default function Button({
  children,
  type = "button",
  bgColor = "bg-black",
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
        px-6 
        py-3 
        rounded-lg 
        font-medium 
        tracking-wide
        transition-all 
        duration-200
        hover:opacity-90 
        hover:shadow-md
        active:scale-95
        disabled:opacity-50 
        disabled:cursor-not-allowed
        ${bgColor}
        ${textColor}
        ${className}
      `}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
