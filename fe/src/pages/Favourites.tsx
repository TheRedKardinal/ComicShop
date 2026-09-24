import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useGetItemsQuery } from '../store/apiSlice'
import { useAppSelector } from '../store/hooks'
import { getApiErrorMessage } from '../utils/errors'
import ItemCard from '../components/ItemCard'
import PixelLoader from '../components/ui/PixelLoader'
import Pager from '../components/ui/Pager'
import PixelSprite from '../components/pixel/PixelSprite'
import type { SpriteName } from '../components/pixel/sprites'
import usePageAccent from '../hooks/usePageAccent'
import { CATEGORY_LABELS, getAccent, type ComicCategory, type Item } from '../types'
import './Favourites.css'

const PAGE_SIZE = 12

type Shelf = ComicCategory | 'TUTTI'

interface Sound {
  text: string
  /** Scritta giapponese in verticale, alla JoJo. */
  jp?: boolean
}

interface Scene {
  heroes: SpriteName[]
  sounds: Sound[]
}

// Ogni scaffale ha i suoi eroi e i suoi rumori da fumetto.
const SCENES: Record<Shelf, Scene> = {
  TUTTI: {
    heroes: ['ragno', 'vegeta', 'indagatore', 'paperino'],
    sounds: [{ text: 'POW!' }, { text: 'ゴゴゴ', jp: true }, { text: 'GULP!' }, { text: 'WOW!' }],
  },
  SUPEREROI: {
    heroes: ['ragno', 'batman'],
    sounds: [{ text: 'POW!' }, { text: 'THWIP!' }, { text: 'BAM!' }, { text: 'KRAK!' }],
  },
  MANGA: {
    heroes: ['crazyDiamond', 'vegeta', 'gatsu'],
    sounds: [{ text: 'ゴゴゴゴ', jp: true }, { text: 'ドドドド', jp: true }, { text: 'バーン!', jp: true }, { text: 'ドン!', jp: true }],
  },
  FUMETTO_ITALIANO: {
    heroes: ['indagatore', 'paperino'],
    sounds: [{ text: 'GIUDA BALLERINO!' }, { text: 'QUACK!' }, { text: 'SLAM!' }, { text: 'SGRUNT!' }],
  },
  ALTRO: {
    heroes: ['robot'],
    sounds: [{ text: 'BOOM!' }, { text: 'ZZZ...' }, { text: 'CLICK!' }, { text: 'WOW!' }],
  },
}

const byPublisherThenName = (a: Item, b: Item) =>
  (a.publisher ?? '~').localeCompare(b.publisher ?? '~') || a.name.localeCompare(b.name)

export default function Favourites() {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const { data: items = [], isLoading, error } = useGetItemsQuery(undefined, { skip: !isAuthenticated })
  const [shelf, setShelf] = useState<Shelf>('TUTTI')
  const [page, setPage] = useState(0)

  const favourites = useMemo(() => items.filter((i) => i.favourite).sort(byPublisherThenName), [items])
  const shelves = useMemo(
    () =>
      (Object.keys(CATEGORY_LABELS) as ComicCategory[])
        .map((category) => ({ category, count: favourites.filter((i) => i.category === category).length }))
        .filter(({ count }) => count > 0),
    [favourites],
  )

  // Se l'ultimo preferito di uno scaffale viene tolto, si torna a "Tutti".
  const currentShelf: Shelf = shelf !== 'TUTTI' && shelves.some((s) => s.category === shelf) ? shelf : 'TUTTI'
  const shown = currentShelf === 'TUTTI' ? favourites : favourites.filter((i) => i.category === currentShelf)
  const totalPages = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages - 1)

  usePageAccent(currentShelf === 'TUTTI' ? 'red' : getAccent(currentShelf, null))

  const selectShelf = (next: Shelf) => {
    setShelf(next)
    setPage(0)
  }

  if (!isAuthenticated) {
    return (
      <div className="cs-favs">
        <EmptyState hero="indagatore" sound="SIGH!" text="Accedi per vedere i fumetti che hai salvato.">
          <Link to="/login" className="cs-favs__cta">
            Accedi
          </Link>
        </EmptyState>
      </div>
    )
  }

  return (
    <div className="cs-favs">
      <header className="cs-favs__header">
        <h1>I tuoi preferiti</h1>
        {favourites.length > 0 && (
          <p>{favourites.length === 1 ? '1 fumetto salvato' : `${favourites.length} fumetti salvati`}</p>
        )}
      </header>

      {isLoading && <PixelLoader />}

      {!isLoading && error && (
        <p className="cs-favs__error pixel-panel">{getApiErrorMessage(error, 'Impossibile caricare i preferiti.')}</p>
      )}

      {!isLoading && !error && favourites.length === 0 && (
        <EmptyState hero="paperone" sound="SGRUNT!" text="Non hai ancora salvato nessun fumetto. Tocca il cuore su una copertina!">
          <Link to="/catalogo" className="cs-favs__cta">
            Vai al catalogo
          </Link>
        </EmptyState>
      )}

      {!isLoading && !error && favourites.length > 0 && (
        <>
          <nav className="cs-favs__tabs" aria-label="Scaffali dei preferiti">
            <button type="button" aria-pressed={currentShelf === 'TUTTI'} onClick={() => selectShelf('TUTTI')}>
              Tutti <span>{favourites.length}</span>
            </button>
            {shelves.map(({ category, count }) => (
              <button
                key={category}
                type="button"
                aria-pressed={currentShelf === category}
                onClick={() => selectShelf(category)}
              >
                {CATEGORY_LABELS[category]} <span>{count}</span>
              </button>
            ))}
          </nav>

          <SceneBanner key={currentShelf} shelf={currentShelf} />

          <div className="cs-favs__grid">
            {shown.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE).map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {totalPages > 1 && (
            <Pager page={currentPage} totalPages={totalPages} onChange={setPage} label="Pagine dei preferiti" />
          )}
        </>
      )}
    </div>
  )
}

function SceneBanner({ shelf }: { shelf: Shelf }) {
  const { heroes, sounds } = SCENES[shelf]

  return (
    <section className={`cs-scene cs-scene--${shelf.toLowerCase()} pixel-panel`} aria-hidden="true">
      {sounds.map((sound, index) => (
        <span
          key={sound.text}
          className={`cs-sfx cs-sfx--${index}${sound.jp ? ' cs-sfx--jp' : ''}${sound.text.length > 8 ? ' cs-sfx--long' : ''}`}
          style={{ animationDelay: `${index * 0.12}s` }}
        >
          {sound.text}
        </span>
      ))}
      <div className="cs-scene__heroes">
        {heroes.map((hero, index) => (
          <PixelSprite
            key={hero}
            name={hero}
            pixel={6}
            className={`cs-scene__hero cs-scene__hero--${index}`}
          />
        ))}
      </div>
    </section>
  )
}

interface EmptyStateProps {
  hero: SpriteName
  sound: string
  text: string
  children: ReactNode
}

function EmptyState({ hero, sound, text, children }: EmptyStateProps) {
  return (
    <div className="cs-favs__empty pixel-panel">
      <div className="cs-favs__empty-hero">
        <span className="cs-sfx cs-sfx--bubble">{sound}</span>
        <PixelSprite name={hero} pixel={7} className="cs-scene__hero" />
      </div>
      <p>{text}</p>
      {children}
    </div>
  )
}
