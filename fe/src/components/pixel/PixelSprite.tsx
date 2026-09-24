import { PALETTE, SPRITES, type SpriteName } from './sprites'

interface PixelSpriteProps {
  name: SpriteName
  /** Lato di un pixel dello sprite, in px dello schermo. */
  pixel?: number
  className?: string
}

export default function PixelSprite({ name, pixel = 6, className }: PixelSpriteProps) {
  const rows = SPRITES[name]
  const width = rows[0].length
  const height = rows.length

  // Un rettangolo per ogni tratto consecutivo dello stesso colore, invece di uno per pixel.
  const runs: { x: number; y: number; w: number; color: string }[] = []
  rows.forEach((row, y) => {
    let x = 0
    while (x < width) {
      const ch = row[x]
      let end = x + 1
      while (end < width && row[end] === ch) end++
      if (ch !== '.') runs.push({ x, y, w: end - x, color: PALETTE[ch] })
      x = end
    }
  })

  return (
    <svg
      className={className}
      width={width * pixel}
      height={height * pixel}
      viewBox={`0 0 ${width} ${height}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {runs.map(({ x, y, w, color }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={1} fill={color} />
      ))}
    </svg>
  )
}
