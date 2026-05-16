export default function Skeleton() {
  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-lg animate-pulse flex-col bg-surface-50 dark:bg-surface-950 sm:my-4 sm:min-h-0 sm:rounded-3xl">
      {/* Header skeleton */}
      <div className="px-5 pt-5 pb-3">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-7 w-28 rounded-lg bg-surface-200 dark:bg-surface-800" />
          <div className="h-5 w-20 rounded-lg bg-surface-200 dark:bg-surface-800" />
        </div>
        <div className="h-1.5 w-full rounded-full bg-surface-200 dark:bg-surface-800" />
      </div>

      {/* Found words skeleton */}
      <div className="px-5 pb-2">
        <div className="h-12 w-full rounded-2xl bg-surface-200 dark:bg-surface-800" />
      </div>

      {/* Input skeleton */}
      <div className="mt-6 flex justify-center">
        <div className="h-10 w-40 rounded-lg bg-surface-200 dark:bg-surface-800" />
      </div>

      {/* Grid skeleton */}
      <div className="mt-8 flex justify-center">
        <div className="relative" style={{ width: '240px', height: '240px' }}>
          <div
            className="absolute h-20 w-20 rounded-full bg-surface-200 dark:bg-surface-800"
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          />
          {[0, 60, 120, 180, 240, 300].map((angle) => {
            const rad = (angle - 90) * (Math.PI / 180)
            const x = Math.cos(rad) * 72
            const y = Math.sin(rad) * 72
            return (
              <div
                key={angle}
                className="absolute h-16 w-16 rounded-full bg-surface-200 dark:bg-surface-800"
                style={{
                  left: `calc(50% + ${x}px)`,
                  top: `calc(50% + ${y}px)`,
                  transform: 'translate(-50%, -50%)',
                }}
              />
            )
          })}
        </div>
      </div>

      {/* Controls skeleton */}
      <div className="mt-8 flex justify-center gap-4">
        <div className="h-12 w-20 rounded-full bg-surface-200 dark:bg-surface-800" />
        <div className="h-12 w-12 rounded-full bg-surface-200 dark:bg-surface-800" />
        <div className="h-12 w-24 rounded-full bg-surface-200 dark:bg-surface-800" />
      </div>
    </div>
  )
}
