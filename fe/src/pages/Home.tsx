import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import './Home.css'

const FEATURES = [
  { icon: '⚡', title: 'Catalogo vivo', text: 'Fumetti importati in tempo reale da Open Library.' },
  { icon: '💥', title: 'Preferiti', text: 'Salva le tue letture da collezionare più tardi.' },
  { icon: '🛡️', title: 'Account sicuro', text: 'Login protetto con autenticazione JWT.' },
]

export default function Home() {
  return (
    <div className="cs-home">
      <section className="cs-hero">
        <motion.span
          className="cs-hero__burst"
          initial={{ scale: 0, rotate: -18, opacity: 0 }}
          animate={{ scale: 1, rotate: -4, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.1 }}
        >
          NEW!
        </motion.span>

        <motion.h1
          className="cs-hero__title"
          initial={{ y: -24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          COMIC<span>SHOP</span>
        </motion.h1>

        <motion.p
          className="cs-hero__tagline"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25, duration: 0.4 }}
        >
          La fumetteria pixel-perfect per veri supereroi. Sfoglia il catalogo e trova la tua prossima avventura.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Link to="/catalogo" className="cs-hero__cta">
            Entra nel catalogo
          </Link>
        </motion.div>

        <div className="cs-hero__deco cs-hero__deco--star" aria-hidden="true">
          ★
        </div>
        <div className="cs-hero__deco cs-hero__deco--pow" aria-hidden="true">
          POW!
        </div>
        <div className="cs-hero__deco cs-hero__deco--bam" aria-hidden="true">
          BAM!
        </div>
      </section>

      <section className="cs-features">
        {FEATURES.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="cs-feature pixel-panel pixel-corners-sm"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.35, delay: index * 0.1 }}
          >
            <span className="cs-feature__icon">{feature.icon}</span>
            <h3>{feature.title}</h3>
            <p>{feature.text}</p>
          </motion.div>
        ))}
      </section>
    </div>
  )
}
