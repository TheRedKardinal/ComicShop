import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls } from 'framer-motion'
import { useGetItemsQuery } from '../store/apiSlice'
import { getApiErrorMessage } from '../utils/errors'
import ItemCard from '../components/ItemCard'
import PixelLoader from '../components/ui/PixelLoader'
import Pager from '../components/ui/Pager'
import usePageAccent from '../hooks/usePageAccent'
import { CATEGORY_LABELS, getAccent, type ComicCategory, type Item } from '../types'
import './Catalog.css'

const PAGE_SIZE = 25

/*
 * Voltare pagina come in un albo, con la costola sul bordo sinistro.
 * Sotto c'è sempre una pagina ferma; sopra, un "foglio" con fronte e retro
 * ruota di 180° attorno alla costola.
 * - Avanti: sotto c'è già la pagina nuova, il foglio mostra la vecchia e gira
 *   da 0° a -180°, andando a posarsi a sinistra con il retro in vista.
 * - Indietro: sotto resta la pagina attuale, il foglio con la precedente
 *   arriva da sinistra (-180°) e si richiude su di essa (0°).
 * A sinistra della costola resta sempre il retro della pagina già letta
 * (quanto ne entra nello schermo): il foglio ci si posa sopra o se ne stacca,
 * così a fine giro non sparisce nulla.
 */
const TURN_DURATION = 0.9
const TURN_EASE = [0.45, 0.05, 0.25, 1] as const

interface Turn {
  leafPage: number
  forward: boolean
}

export default function Catalog() {
  const { data: items = [], isLoading, error } = useGetItemsQuery()
  const [category, setCategory] = useState<ComicCategory | null>(null)
  const [publisher, setPublisher] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [turn, setTurn] = useState<Turn | null>(null)
  const turnControls = useRef<AnimationPlaybackControls | null>(null)
  const rotate = useMotionValue(0)
  // Ombre legate all'angolo: il foglio scurisce mentre si solleva, la pagina sotto riceve la sua ombra.
  const frontShade = useTransform(rotate, [0, -90], [0, 0.55])
  const backShade = useTransform(rotate, [-90, -180], [0.45, 0])
  const castShadow = useTransform(rotate, [0, -45, -120, -180], [0, 0.4, 0.15, 0])
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
  const itemsOf = (p: number) => visibleItems.slice(p * PAGE_SIZE, (p + 1) * PAGE_SIZE)
  // C'è una pagina voltata a sinistra se prima di quella aperta ce n'è almeno una;
  // durante il giro conta la minore tra le due pagine coinvolte (è quella del foglio).
  const showVerso = (turn ? turn.leafPage : currentPage) > 0

  const goToPage = useCallback(
    (next: number) => {
      // Mentre un foglio sta girando si ignorano altri comandi.
      if (turn || next < 0 || next >= totalPages || next === currentPage) return
      topRef.current?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' })

      if (reduceMotion) {
        setPage(next)
        return
      }

      const forward = next > currentPage
      rotate.set(forward ? 0 : -180)
      setTurn({ leafPage: forward ? currentPage : next, forward })
      if (forward) setPage(next)

      turnControls.current = animate(rotate, forward ? -180 : 0, {
        duration: TURN_DURATION,
        ease: TURN_EASE,
        onComplete: () => {
          if (!forward) setPage(next)
          setTurn(null)
        },
      })
    },
    [turn, currentPage, totalPages, reduceMotion, rotate],
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

  const stopTurn = () => {
    turnControls.current?.stop()
    setTurn(null)
  }

  useEffect(() => () => turnControls.current?.stop(), [])

  usePageAccent(getAccent(category, publisher))

  const selectCategory = (next: ComicCategory | null) => {
    setCategory(next)
    setPublisher(null)
    setPage(0)
    stopTurn()
  }

  const selectPublisher = (next: string | null) => {
    setPublisher(next)
    setPage(0)
    stopTurn()
  }

  const pager =
    totalPages > 1 ? (
      <Pager page={currentPage} totalPages={totalPages} onChange={goToPage} label="Pagine del catalogo" />
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
            {showVerso && <div className="cs-catalog__verso" aria-hidden="true" />}
            <section className="cs-catalog__page" aria-label={`Pagina ${currentPage + 1} di ${totalPages}`}>
              <PageContent items={itemsOf(currentPage)} folio={currentPage + 1} />
              {turn && <motion.div className="cs-catalog__cast" style={{ opacity: castShadow }} />}
            </section>

            {turn && (
              <motion.div className="cs-catalog__leaf" style={{ rotateY: rotate }} aria-hidden="true">
                <div className="cs-catalog__page cs-catalog__leaf-front">
                  <PageContent items={itemsOf(turn.leafPage)} folio={turn.leafPage + 1} />
                  <motion.div className="cs-catalog__shade" style={{ opacity: frontShade }} />
                </div>
                <div className="cs-catalog__leaf-back">
                  <motion.div className="cs-catalog__shade" style={{ opacity: backShade }} />
                </div>
              </motion.div>
            )}
          </div>
          {pager}
        </>
      )}
    </div>
  )
}

function PageContent({ items, folio }: { items: Item[]; folio: number }) {
  return (
    <>
      <div className="cs-catalog__grid">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
      <span className="cs-catalog__folio">{folio}</span>
    </>
  )
}
