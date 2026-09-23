const PIXELS: [number, number][] = [
  // shield outline (8x9 grid), drawn as [col, row]
  [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0],
  [0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1],
  [0, 2], [7, 2],
  [0, 3], [7, 3],
  [0, 4], [7, 4],
  [0, 5], [7, 5],
  [1, 6], [6, 6],
  [1, 7], [2, 7], [5, 7], [6, 7],
  [2, 8], [3, 8], [4, 8], [5, 8],
  [3, 9], [4, 9],
]

const STAR: [number, number][] = [
  [3, 2], [4, 2],
  [2, 3], [3, 3], [4, 3], [5, 3],
  [2, 4], [3, 4], [4, 4], [5, 4],
  [3, 5], [4, 5],
]

interface LogoProps {
  size?: number
}

export default function Logo({ size = 40 }: LogoProps) {
  const cell = 1
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 8 10"
      role="img"
      aria-label="ComicShop"
      className="cs-logo"
    >
      {PIXELS.map(([x, y]) => (
        <rect key={`s-${x}-${y}`} x={x} y={y} width={cell} height={cell} fill="var(--cs-red)" />
      ))}
      {STAR.map(([x, y]) => (
        <rect key={`w-${x}-${y}`} x={x} y={y} width={cell} height={cell} fill="var(--cs-white)" />
      ))}
    </svg>
  )
}
