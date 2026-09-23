interface PixelHeartProps {
  filled?: boolean
}

const HEART_PIXELS: [number, number][] = [
  [1, 0], [2, 0], [5, 0], [6, 0],
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
  [0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2],
  [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3],
  [2, 4], [3, 4], [4, 4], [5, 4],
  [3, 5], [4, 5],
]

export default function PixelHeart({ filled = false }: PixelHeartProps) {
  return (
    <svg width={20} height={20} viewBox="0 0 8 6" aria-hidden="true">
      {HEART_PIXELS.map(([x, y]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={1}
          height={1}
          fill={filled ? 'var(--cs-red)' : 'var(--cs-white)'}
          stroke="var(--cs-black)"
          strokeWidth={0.12}
        />
      ))}
    </svg>
  )
}
