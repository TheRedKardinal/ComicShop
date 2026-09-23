import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useGetItemsQuery } from '../store/apiSlice'
import { getApiErrorMessage } from '../utils/errors'
import ItemCard from '../components/ItemCard'
import PixelLoader from '../components/ui/PixelLoader'
import { CATEGORY_LABELS, getAccent, type ComicCategory } from '../types'
import './Catalog.css'

export default function Catalog() {
  const { data: items = [], isLoading, error } = useGetItemsQuery()
  const [category, setCategory] = useState<ComicCategory | null>(null)
  const [publisher, setPublisher] = useState<string | null>(null)

  // Solo le categorie e gli editori che hanno davvero dei fumetti in catalogo.
  const categories = useMemo(
    () => (Object.keys(CATEGORY_LABELS) as ComicCategory[]).filter((c) => items.some((i) => i.category === c)),
    [items],
  )
  const publishers = useMemo(
    () =>
      [...new Set(items.filter((i) => !category || i.category === category).map((i) => i.publisher))]
        .filter((p): p is string => p !== null)
        .sort(),
    [items, category],
  )
  const visibleItems = items.filter(
    (i) => (!category || i.category === category) && (!publisher || i.publisher === publisher),
  )

  // Il colore della pagina (navbar compresa) segue il filtro: lo applichiamo a <html>.
  const accent = getAccent(category, publisher)
  useEffect(() => {
    const root = document.documentElement
    if (accent === 'red') delete root.dataset.accent
    else root.dataset.accent = accent
    return () => {
      delete root.dataset.accent
    }
  }, [accent])

  const selectCategory =(next: ComicCategory | null) => {
    setCategory(next)
    setPublisher(null)
  }

  return (
    <div className="cs-catalog">
      <header className="cs-catalog__header">
        <h1>Catalogo</h1>
        <p>{items.length > 0 ? `${visibleItems.length} fumetti pronti per te` : 'Tutti i fumetti disponibili'}</p>
      </header>

      {items.length > 0 && (
        <nav className="cs-catalog__filters" aria-label="Filtra il catalogo">
          <div className="cs-catalog__chips">
            <button type="button" aria-pressed={category === null} onClick={() => selectCategory(null)}>
              Tutti
            </button>
            {categories.map((c) => (
              <button key={c} type="button" aria-pressed={category === c} onClick={() => selectCategory(c)}>
                {CATEGORY_LABELS[c]}
              </button>
            ))}
          </div>
          {publishers.length > 1 && (
            <div className="cs-catalog__chips cs-catalog__chips--small">
              {publishers.map((p) => (
                <button
                  key={p}
                  type="button"
                  aria-pressed={publisher === p}
                  onClick={() => setPublisher(publisher === p ? null : p)}
                >
                  {p}
                </button>
              ))}
            </div>
          )}
        </nav>
      )}

      {isLoading && <PixelLoader />}

      {!isLoading && error && (
        <p className="cs-catalog__error pixel-panel">{getApiErrorMessage(error, 'Impossibile caricare il catalogo.')}</p>
      )}

      {!isLoading && !error && items.length > 0 && visibleItems.length === 0 && (
        <p className="cs-catalog__empty pixel-panel">Nessun fumetto per questo filtro.</p>
      )}

      {!isLoading && !error && items.length === 0 && (
        <p className="cs-catalog__empty pixel-panel">Nessun fumetto disponibile al momento.</p>
      )}

      {!isLoading && !error && visibleItems.length > 0 && (
        <motion.div
          className="cs-catalog__grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
          }}
        >
          {visibleItems.map((item) => (
            <motion.div
              key={item.id}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0 },
              }}
            >
              <ItemCard item={item} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
