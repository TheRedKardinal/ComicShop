import { Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Navbar from './components/layout/Navbar'
import './App.css'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Login from './pages/Login'
import Register from './pages/Register'

function App() {
  return (
    <>
      <Navbar />
      <main className="cs-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/login" element={<Login />} />
          <Route path="/registrati" element={<Register />} />
        </Routes>
      </main>
      <Toaster
        position="bottom-center"
        toastOptions={{
          style: {
            fontFamily: 'var(--cs-font-body)',
            fontSize: '18px',
            border: '3px solid var(--cs-black)',
            borderRadius: 0,
            boxShadow: '4px 4px 0 var(--cs-black)',
          },
        }}
      />
    </>
  )
}

export default App
