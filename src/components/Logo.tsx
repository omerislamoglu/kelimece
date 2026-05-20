interface LogoProps {
  compact?: boolean
}

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 64 64"
      role="img"
      aria-label="Kelimece logosu"
    >
      <defs>
        <linearGradient id="logo-bg" x1="10" y1="8" x2="56" y2="58">
          <stop stopColor="#0f766e" />
          <stop offset="0.58" stopColor="#14b8a6" />
          <stop offset="1" stopColor="#f59e0b" />
        </linearGradient>
        <linearGradient id="logo-tile" x1="20" y1="16" x2="45" y2="48">
          <stop stopColor="#fffdf7" />
          <stop offset="1" stopColor="#f2ede7" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#logo-bg)" />
      <path
        d="M18.8 16.5 32 8.9l13.2 7.6v15.2L32 39.3l-13.2-7.6V16.5Z"
        fill="#ccfbf1"
        opacity="0.24"
      />
      <path
        d="M18.8 32.3 32 24.7l13.2 7.6v15.2L32 55.1l-13.2-7.6V32.3Z"
        fill="#134e4a"
        opacity="0.18"
      />
      {[
        [32, 15.5, 'E'],
        [45.7, 23.4, 'L'],
        [45.7, 39.2, 'İ'],
        [32, 47.1, 'M'],
        [18.3, 39.2, 'E'],
        [18.3, 23.4, 'C'],
      ].map(([x, y, letter]) => (
        <g key={letter} transform={`translate(${x} ${y})`}>
          <path
            d="M0-8.2 7.1-4.1v8.2L0 8.2-7.1 4.1v-8.2L0-8.2Z"
            fill="#fffdf7"
            opacity="0.92"
          />
          <text
            y="3.6"
            textAnchor="middle"
            fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
            fontSize="9"
            fontWeight="800"
            fill="#0f766e"
          >
            {letter}
          </text>
        </g>
      ))}
      <g transform="translate(32 31.3)">
        <path
          d="M0-12.2 10.6-6.1V6.1L0 12.2-10.6 6.1v-12.2L0-12.2Z"
          fill="url(#logo-tile)"
        />
        <path
          d="M0-12.2 10.6-6.1V6.1L0 12.2-10.6 6.1v-12.2L0-12.2Z"
          fill="none"
          stroke="#0f766e"
          strokeOpacity="0.14"
        />
        <text
          y="6.1"
          textAnchor="middle"
          fontFamily="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif"
          fontSize="18"
          fontWeight="900"
          fill="#134e4a"
        >
          K
        </text>
      </g>
    </svg>
  )
}

export default function Logo({ compact = false }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5">
      <LogoMark />
      {!compact && (
        <span className="text-2xl font-black tracking-tight text-surface-900 dark:text-surface-100">
          Kelimece
        </span>
      )}
    </div>
  )
}
