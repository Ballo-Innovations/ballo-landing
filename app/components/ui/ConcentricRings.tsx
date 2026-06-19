export default function ConcentricRings() {
  return (
    <svg
      viewBox="0 0 800 800"
      className="w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient
          id="rings"
          x1="0%"
          y1="50%"
          x2="100%"
          y2="50%"
        >
          <stop offset="0%" stopColor="#DDE7F0" stopOpacity="1" />
          <stop offset="55%" stopColor="#8B95C8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#8B95C8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[290, 250, 210, 170, 130].map((r) => (
        <circle
          key={r}
          cx="400"
          cy="400"
          r={r}
          fill="none"
          stroke="url(#rings)"
          strokeWidth="10"
        />
      ))}
    </svg>
  );
}
