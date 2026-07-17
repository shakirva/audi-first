import React from "react";

export default function Logo({ size = 44, bgColor = "#0A0A0A", iconColor = "#FFFFFF" }) {
  // Using a 100x100 viewBox for crisp scaling
  const sw = 12; // Stroke width
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size} 
      height={size} 
      viewBox="0 0 100 100"
      style={{ borderRadius: size * 0.15, display: 'block' }}
    >
      <rect width="100" height="100" fill={bgColor} />
      <path 
        d="
          M 25 35 
          L 50 18 
          L 75 35 
          L 75 70 
          L 50 87 
          L 25 70 
          Z
          M 25 48
          L 50 65
          L 75 48
        " 
        fill="none" 
        stroke={iconColor} 
        strokeWidth={sw} 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  );
}
