import type { ButtonHTMLAttributes } from 'react'
import './PixelButton.css'

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost'
}

export default function PixelButton({ variant = 'primary', className = '', ...rest }: PixelButtonProps) {
  return <button className={`cs-pixel-btn cs-pixel-btn--${variant} ${className}`.trim()} {...rest} />
}
