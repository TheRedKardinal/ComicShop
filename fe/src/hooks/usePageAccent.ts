import { useEffect } from 'react'
import type { Accent } from '../types'

// Il colore della pagina (navbar compresa) segue il filtro: lo applichiamo a <html>.
export default function usePageAccent(accent: Accent) {
  useEffect(() => {
    const root = document.documentElement
    if (accent === 'red') delete root.dataset.accent
    else root.dataset.accent = accent
    return () => {
      delete root.dataset.accent
    }
  }, [accent])
}
