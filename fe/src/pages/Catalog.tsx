import { motion } from 'framer-motion'
import { useGetItemsQuery } from '../store/apiSlice'
import { getApiErrorMessage } from '../utils/errors'
import ItemCard from '../components/ItemCard'
import PixelLoader from '../components/ui/PixelLoader'
import './Catalog.css'

export default function Catalog() {
  const { data: items = [], isLoading, error } = useGetItemsQuery()

  return (
    <div className="cs-catalog">
      <header className="cs-catalog__header">
        <h1>Catalogo</h1>
        <p>{items.length > 0 ? `${items.length} fumetti pronti per te` : 'Tutti i fumetti disponibili'}</p>
      </header>

      {isLoading && <PixelLoader />}

      {!isLoading && error && (
        <p className="cs-catalog__error pixel-panel">{getApiErrorMessage(error, 'Impossibile caricare il catalogo.')}</p>
      )}

      {!isLoading && !error && items.length === 0 && (
        <p className="cs-catalog__empty pixel-panel">Nessun fumetto disponibile al momento.</p>
      )}

      {!isLoading && !error && items.length > 0 && (
        <motion.div
          className="cs-catalog__grid"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.04 } },
          }}
        >
          {items.map((item) => (
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
