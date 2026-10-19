interface IconProps {
  name: "book" | "satellite" | "antenna" | "signal" | "sun" | "orbit" | "unknown";
}

export function Icon({ name }: IconProps) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      {name === "book" && (
        <>
          <path {...common} d="M7 6.5h13.5A3.5 3.5 0 0 1 24 10v15.5H10.5A3.5 3.5 0 0 0 7 29z" />
          <path {...common} d="M7 6.5v22.5" />
        </>
      )}
      {name === "satellite" && (
        <>
          <rect {...common} x="12" y="12" width="8" height="8" rx="1.5" />
          <path {...common} d="M12 14 6 8M20 14l6-6M12 18l-6 6M20 18l6 6" />
        </>
      )}
      {name === "antenna" && (
        <>
          <path {...common} d="M16 28V14" />
          <path {...common} d="M10 28h12" />
          <path {...common} d="M16 14a6 6 0 0 1 6-6M16 14a6 6 0 0 0-6-6" />
          <path {...common} d="M16 8V4" />
        </>
      )}
      {name === "signal" && (
        <>
          <path {...common} d="M8 20c2.4-5 4.6-5 7 0s4.6 5 9 0" />
          <circle {...common} cx="16" cy="20" r="1.2" fill="currentColor" stroke="none" />
        </>
      )}
      {name === "sun" && (
        <>
          <circle {...common} cx="16" cy="16" r="4" />
          <path {...common} d="M16 6v2.5M16 23.5V26M6 16h2.5M23.5 16H26M9 9l1.8 1.8M21.2 21.2 23 23M23 9l-1.8 1.8M10.8 21.2 9 23" />
        </>
      )}
      {name === "orbit" && (
        <>
          <ellipse {...common} cx="16" cy="16" rx="10" ry="4.5" transform="rotate(-25 16 16)" />
          <circle cx="23" cy="12" r="1.4" fill="currentColor" stroke="none" />
        </>
      )}
      {name === "unknown" && (
        <>
          <circle {...common} cx="16" cy="16" r="8" />
          <path {...common} d="M13.5 13.5a2.5 2.5 0 1 1 3.2 2.4c-.7.3-1.2.9-1.2 1.6V19" />
          <circle cx="16" cy="22" r="0.8" fill="currentColor" stroke="none" />
        </>
      )}
    </svg>
  );
}
