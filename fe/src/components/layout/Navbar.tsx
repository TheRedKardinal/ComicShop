import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import toast from 'react-hot-toast'
import Logo from './Logo'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { clearAuth } from '../../store/authSlice'
import { useLogoutMutation } from '../../store/apiSlice'
import './Navbar.css'

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/catalogo', label: 'Catalogo' },
]

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)
  const username = useAppSelector((state) => state.auth.username)
  const [logoutRequest] = useLogoutMutation()

  const closeMenu = () => setMenuOpen(false)

  const handleLogout = async () => {
    try {
      await logoutRequest().unwrap()
    } catch {
      // il token lato server potrebbe essere già scaduto: si procede comunque col logout locale
    } finally {
      dispatch(clearAuth())
      closeMenu()
      toast.success('A presto, eroe!')
      navigate('/')
    }
  }

  return (
    <header className="cs-navbar pixel-panel">
      <NavLink to="/" className="cs-navbar__brand" onClick={closeMenu}>
        <Logo size={34} />
        <span className="cs-navbar__title">ComicShop</span>
      </NavLink>

      <nav className="cs-navbar__center" aria-label="Navigazione principale">
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `cs-navbar__link${isActive ? ' cs-navbar__link--active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>

      <div className="cs-navbar__actions">
        <button
          type="button"
          className={`cs-burger${menuOpen ? ' cs-burger--open' : ''}`}
          aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>

        <AnimatePresence>
          {menuOpen && (
            <>
              <motion.button
                type="button"
                className="cs-burger__backdrop"
                aria-label="Chiudi menu"
                onClick={closeMenu}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
              <motion.div
                className="cs-burger__panel pixel-panel pixel-corners"
                initial={{ opacity: 0, y: -16, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.9 }}
                transition={{ duration: 0.18, ease: 'easeOut' }}
              >
                {isAuthenticated ? (
                  <>
                    <p className="cs-burger__hello">Ciao, {username}!</p>
                    <button type="button" className="cs-burger__item" onClick={handleLogout}>
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <NavLink to="/login" className="cs-burger__item" onClick={closeMenu}>
                      Login
                    </NavLink>
                    <NavLink to="/registrati" className="cs-burger__item" onClick={closeMenu}>
                      Registrati
                    </NavLink>
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}
