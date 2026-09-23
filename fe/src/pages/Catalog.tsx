import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, type Variants } from 'framer-motion'
import { useGetItemsQuery } from '../store/apiSlice'
import { getApiErrorMessage } from '../utils/errors'
import ItemCard from '../components/ItemCard'
import PixelLoader from '../components/ui/PixelLoader'
import { CATEGORY_LABELS, getAccent, type ComicCategory } from '../types'
import './Catalog.css'

const PAGE_SIZE = 25

/*
 * Voltare pagina come in un albo: la pagina gira attorno al bordo sinistro
 * (la "costola"). Avanti: la pagina corrente si solleva e ruota verso sinistra
 * scoprendo la successiva. Indietro: la pagina precedente torna giù da sinistra.
 * custom = direzione (1 avanti, -1 indietro).
 */
const pageVariants: Variants = {
  enter: (direction: number) =>
    direction > 0
      ? { rotateY: 12, opacity: 0.4, filter: 'brightness(0.85)' }
      : { rotateY: -110, opacity: 1, filter: 'brightness(0.6)' },
  center: {
    rotateY: 0,
    opacity: 1,
    filter: 'brightness(1)',
    transition: { duration: 0.55, ease: [0.3, 0.7, 0.2, 1] },
  },
  exit: (direction: number) =>
    direction > 0
      ? { rotateY: -110, filter: 'brightness(0.6)', transition: { duration: 0.5, ease: [0.5, 0, 0.8, 0.4] } }
      : { rotateY: 12, opacity: 0.4, filter: 'brightness(0.85)', transition: { duration: 0.3 } },
}

const fadeVariants: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.15 } },
}

export default function Catalog() {
  const { data: items = [], isLoading, error } = useGetItemsQuery()
  const [category, setCategory] = useState<ComicCategory | null>(null)
  const [publisher, setPublisher] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [direction, setDirection] = useState(1)
  const reduceMotion = useReducedMotion()
  const topRef = useRef<HTMLDivElement>(null)

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

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / PAGE_SIZE))
  // Se il catalogo si accorcia (es. dopo un filtro) non restiamo su una pagina che non esiste più.
  const currentPage = Math.min(page, totalPages - 1)
  const pageItems = visibleItems.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE)

  const goToPage = useCallback(
    (next: number) => {
      if (next < 0 || next >= totalPages || next === currentPage) return
      setDirection(next > currentPage ? 1 : -1)
      setPage(next)
      topRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })
    },
    [currentPage, totalPages, reduceMotion],
  )

  // Frecce della tastiera per sfogliare, tranne quando si sta scrivendo in un campo.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) return
      if (e.key === 'ArrowRight') goToPage(currentPage + 1)
      if (e.key === 'ArrowLeft') goToPage(currentPage - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [goToPage, currentPage])

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

  const selectCategory = (next: ComicCategory | null) => {
    setCategory(next)
    setPublisher(null)
    setPage(0)
  }

  const selectPublisher = (next: string | null) => {
    setPublisher(next)
    setPage(0)
  }

  const pager =
    totalPages > 1 ? (
      <Pager page={currentPage} totalPages={totalPages} onChange={goToPage} />
    ) : null

  return (
    <div className="cs-catalog" ref={topRef}>
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
                  onClick={() => selectPublisher(publisher === p ? null : p)}
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
        <>
          {pager}
          <div className="cs-catalog__book">
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              <motion.section
                key={`${category ?? 'all'}-${publisher ?? 'all'}-${currentPage}`}
                className="cs-catalog__page"
                custom={direction}
                variants={reduceMotion ? fadeVariants : pageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                aria-label={`Pagina ${currentPage + 1} di ${totalPages}`}
              >
                <div className="cs-catalog__grid">
                  {pageItems.map((item) => (
                    <ItemCard key={item.id} item={item} />
                  ))}
                </div>
                <span className="cs-catalog__folio">{currentPage + 1}</span>
              </motion.section>
            </AnimatePresence>
          </div>
          {pager}
        </>
      )}
    </div>
  )
}

interface PagerProps {
  page: number
  totalPages: number
  onChange: (page: number) => void
}

function Pager({ page, totalPages, onChange }: PagerProps) {
  // Prima, ultima e le due vicine alla corrente; il resto diventa "…".
  const shown = [...Array(totalPages).keys()].filter((p) => p === 0 || p === totalPages - 1 || Math.abs(p - page) <= 1)

  return (
    <nav className="cs-catalog__pager" aria-label="Pagine del catalogo">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page === 0} aria-label="Pagina precedente">
        ◀
      </button>
      {shown.map((p, index) => (
        <span key={p} className="cs-catalog__pager-slot">
          {index > 0 && p - shown[index - 1] > 1 && <span className="cs-catalog__pager-gap">…</span>}
          <button type="button" onClick={() => onChange(p)} aria-current={p === page ? 'page' : undefined}>
            {p + 1}
          </button>
        </span>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages - 1}
        aria-label="Pagina successiva"
      >
        ▶
      </button>
    </nav>
  )
}
