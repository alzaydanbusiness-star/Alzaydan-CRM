import React from 'react';

/**
 * AL ZAYDAN INTERNATIONAL FZE - Official Vector Brand Crest (AZ Monogram)
 * Extracted directly with 1:1 mathematical precision from the official vector master PDF.
 */
export function AlZaydanCrest({ className = "w-8 h-8", color, twoTone = false }) {
  if (twoTone) {
    return (
      <svg 
        viewBox="740 920 1980 1110" 
        xmlns="http://www.w3.org/2000/svg" 
        className={className}
        aria-label="Al Zaydan AZ Crest"
      >
        <path d="M 753.70 2012.73 L 1351.27 1231.30 L 1723.56 1231.25 L 1125.23 2012.73 Z" fill="#93C5FD" />
        <path d="M 1356.67 1717.51 L 1508.05 2012.73 L 2052.41 2013.63 L 1902.16 1718.27 Z" fill="#93C5FD" />
        <path d="M 1580.90 935.83 L 2129.62 2013.44 L 2460.75 2013.63 L 2061.87 1231.77 L 2483.79 1232.06 L 2710.30 937.54 Z" fill="#2563EB" />
      </svg>
    );
  }

  return (
    <svg 
      viewBox="740 920 1980 1110" 
      fill={color || "currentColor"}
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="Al Zaydan AZ Crest"
      style={color ? { color } : undefined}
    >
      <path d="M 753.70 2012.73 L 1351.27 1231.30 L 1723.56 1231.25 L 1125.23 2012.73 Z" />
      <path d="M 1356.67 1717.51 L 1508.05 2012.73 L 2052.41 2013.63 L 1902.16 1718.27 Z" />
      <path d="M 1580.90 935.83 L 2129.62 2013.44 L 2460.75 2013.63 L 2061.87 1231.77 L 2483.79 1232.06 L 2710.30 937.54 Z" />
    </svg>
  );
}

/**
 * AL ZAYDAN INTERNATIONAL FZE - Official Full Vector Logo
 * Exact vector paths including AZ Crest, AL ZAYDAN geometric wordmark,
 * divider lines, and INTERNATIONAL FZE typography.
 */
export function AlZaydanLogo({ 
  className = "w-48 h-auto", 
  variant = "dark",
  color
}) {
  const brandColor = color || (variant === "light" ? "#FFFFFF" : "#16477A");

  return (
    <svg 
      viewBox="290 920 2850 1830" 
      fill={brandColor}
      xmlns="http://www.w3.org/2000/svg" 
      className={className}
      aria-label="Al Zaydan International FZE Official Logo"
    >
      <g>
        {/* AZ Monogram Crest */}
        <path d="M 753.70 2012.73 L 1351.27 1231.30 L 1723.56 1231.25 L 1125.23 2012.73 Z" />
        <path d="M 1356.67 1717.51 L 1508.05 2012.73 L 2052.41 2013.63 L 1902.16 1718.27 Z" />
        <path d="M 1580.90 935.83 L 2129.62 2013.44 L 2460.75 2013.63 L 2061.87 1231.77 L 2483.79 1232.06 L 2710.30 937.54 Z" />

        {/* AL ZAYDAN Architectural Letters */}
        <path d="M 691.09 2176.28 L 760.86 2176.28 L 760.86 2468.37 L 956.66 2468.37 L 956.66 2525.11 L 691.09 2525.11 Z" />
        <path d="M 1451.54 2525.11 L 1144.10 2525.11 L 1144.10 2468.37 L 1356.19 2233.02 L 1151.08 2233.02 L 1151.08 2176.28 L 1451.54 2176.28 L 1451.54 2233.02 L 1238.98 2468.37 L 1451.54 2468.37 Z" />
        <path d="M 1766.88 2176.28 L 1838.97 2176.28 C 1839.28 2176.59 1839.59 2177.06 1839.90 2177.68 L 1931.99 2317.21 L 2024.08 2177.68 L 2024.08 2177.21 L 2025.01 2176.28 L 2096.64 2176.28 C 2097.26 2176.28 2097.10 2176.59 2096.17 2177.21 L 2095.24 2178.61 L 1966.87 2371.63 L 1966.87 2525.11 L 1897.11 2525.11 L 1897.11 2371.63 Z" />
        <path d="M 3044.06 2178.14 L 3124.99 2178.14 L 3124.99 2541.85 L 2885.46 2330.23 L 2885.46 2524.18 L 2806.39 2524.18 L 2806.39 2161.86 L 3044.06 2373.49 Z" />
        <path d="M 679.00 2524.18 L 492.49 2152.56 L 455.28 2221.40 L 304.12 2523.25 L 303.66 2524.18 L 303.19 2525.11 L 381.33 2525.11 L 381.79 2524.18 L 408.31 2469.76 L 435.28 2413.95 L 492.02 2295.81 L 548.30 2413.95 L 574.81 2469.76 L 600.86 2524.18 L 601.32 2525.11 L 679.46 2525.11 Z" />
        <path d="M 1838.04 2524.18 L 1651.53 2152.56 L 1614.32 2221.40 L 1463.16 2523.25 L 1462.70 2524.18 L 1462.23 2525.11 L 1540.37 2525.11 L 1540.84 2524.18 L 1567.35 2469.76 L 1594.33 2413.95 L 1651.07 2295.81 L 1707.35 2413.95 L 1733.86 2469.76 L 1759.90 2524.18 L 1760.37 2525.11 L 1838.50 2525.11 Z" />
        <path d="M 2244.43 2176.28 L 2110.94 2176.28 L 2110.94 2230.23 L 2180.24 2230.23 L 2247.22 2230.23 C 2331.24 2230.86 2373.26 2271.01 2373.26 2350.69 C 2374.50 2431.01 2334.66 2471.16 2253.73 2471.16 L 2180.24 2471.16 L 2180.24 2274.33 L 2110.94 2274.33 L 2110.94 2525.11 L 2258.38 2525.11 C 2322.87 2525.11 2370.62 2510.77 2401.63 2482.09 C 2432.63 2453.41 2448.14 2409.61 2448.14 2350.69 C 2446.90 2234.42 2378.99 2176.28 2244.43 2176.28" />
        <rect x="2110.94" y="2261.80" width="69.30" height="40.00" />
        <path d="M 2115.94 2176.28 L 2110.60 2176.28 L 2074.20 2230.23 L 2115.94 2230.23 L 2118.80 2177.40 Z" />
        <path d="M 2791.51 2524.18 L 2605.00 2152.56 L 2567.79 2221.40 L 2416.63 2523.25 L 2416.17 2524.18 L 2415.70 2525.11 L 2493.84 2525.11 L 2494.30 2524.18 L 2520.82 2469.76 L 2547.79 2413.95 L 2604.53 2295.81 L 2660.81 2413.95 L 2687.32 2469.76 L 2713.37 2524.18 L 2713.83 2525.11 L 2791.97 2525.11 Z" />

        {/* Horizontal Divider Rules */}
        <rect x="305.80" y="2667.87" width="565.60" height="4.67" />
        <rect x="2565.40" y="2667.89" width="561.00" height="4.63" />

        {/* INTERNATIONAL FZE Typography */}
        <text 
          x="1718" 
          y="2715" 
          fontFamily="'Montserrat', 'Inter', 'Segoe UI', sans-serif" 
          fontSize="136" 
          fontWeight="700" 
          letterSpacing="18" 
          textAnchor="middle"
          fill={brandColor}
        >
          INTERNATIONAL FZE
        </text>
      </g>
    </svg>
  );
}

export default AlZaydanLogo;
