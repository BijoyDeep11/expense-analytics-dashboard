import React from 'react';
// Import the files from your assets folder
import iconLogo from "../../../src/assets/logo-icon.svg"; // Adjust path if needed
import fullLogo from "../../../src/assets/logo-full.svg"; // Adjust path if needed

const Logo = ({ variant = "brand", className = "" }) => {
  const isMinimal = variant === "minimal";

  return (
    <img 
      // Switch the source based on the variant prop
      src={isMinimal ? iconLogo : fullLogo} 
      
      // Accessibility text
      alt={isMinimal ? "HisaabSe Icon" : "HisaabSe Logo"}
      
      // Dynamic sizing + allow custom classes passed via props
      className={`select-none ${isMinimal ? "h-10 w-10" : "h-12 w-auto"} ${className}`}
    />
  );
};

export default Logo;