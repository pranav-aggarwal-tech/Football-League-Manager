// Generates a simple shield-shaped crest from the team's short name and color
// so every team has a visual identity without needing image uploads.
export default function TeamBadge({ shortName = "TBD", color = "#FFC94D", size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 44"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M20 2 L36 8 V22 C36 32 29 40 20 43 C11 40 4 32 4 22 V8 Z"
        fill={color}
        stroke="#0B1F1A"
        strokeWidth="1.5"
      />
      <text
        x="20"
        y="26"
        textAnchor="middle"
        fontFamily="Anton, sans-serif"
        fontSize="14"
        fill="#0B1F1A"
      >
        {shortName}
      </text>
    </svg>
  );
}
