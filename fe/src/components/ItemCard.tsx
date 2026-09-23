import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import type { Item } from '../types'
import { useAddFavouriteMutation, useRemoveFavouriteMutation } from '../store/apiSlice'
import { getApiErrorMessage } from '../utils/errors'
import { useAppSelector } from '../store/hooks'
import PixelHeart from './ui/PixelHeart'
import './ItemCard.css'

interface ItemCardProps {
  item: Item
}

export default function ItemCard({ item }: ItemCardProps) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const navigate = useNavigate()
  const [addFavourite, { isLoading: adding }] = useAddFavouriteMutation()
  const [removeFavourite, { isLoading: removing }] = useRemoveFavouriteMutation()
  const busy = adding || removing

  const priceLabel = new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(item.price)
  const outOfStock = item.stock <= 0

  const toggleFavourite = async () => {
    if (!isAuthenticated) {
      toast('Accedi per salvare i tuoi preferiti', { icon: '🦸' })
      navigate('/login')
      return
    }

    try {
      if (item.favourite) {
        await removeFavourite(item.id).unwrap()
      } else {
        await addFavourite(item.id).unwrap()
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  return (
    <motion.article
      className="cs-card pixel-panel pixel-corners"
      whileHover={{ y: -6, rotate: -1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
    >
      <button
        type="button"
        className="cs-card__fav"
        onClick={toggleFavourite}
        disabled={busy}
        aria-pressed={item.favourite}
        aria-label={item.favourite ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
      >
        <PixelHeart filled={item.favourite} />
      </button>

      <div className="cs-card__cover">
        {item.coverUrl ? (
          <img src={item.coverUrl} alt={item.name} loading="lazy" />
        ) : (
          <div className="cs-card__cover-placeholder">?</div>
        )}
        {item.publisher && <span className="cs-card__publisher">{item.publisher}</span>}
        {outOfStock && <span className="cs-card__badge">ESAURITO</span>}
      </div>

      <div className="cs-card__body">
        <h3 className="cs-card__title">{item.name}</h3>
        {item.author && <p className="cs-card__author">{item.author}</p>}
        <div className="cs-card__footer">
          <span className="cs-card__price">{priceLabel}</span>
          <span className="cs-card__stock">{outOfStock ? '0 pz' : `${item.stock} pz`}</span>
        </div>
      </div>
    </motion.article>
  )
}
