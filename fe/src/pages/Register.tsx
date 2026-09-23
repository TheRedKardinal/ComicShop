import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useRegisterMutation } from '../store/apiSlice'
import { useAppDispatch } from '../store/hooks'
import { setAuth } from '../store/authSlice'
import { getApiErrorMessage } from '../utils/errors'
import PixelButton from '../components/ui/PixelButton'
import './Auth.css'

const schema = z.object({
  username: z.string().min(3, 'Lo username deve avere tra 3 e 50 caratteri').max(50, 'Lo username deve avere tra 3 e 50 caratteri'),
  email: z.string().min(1, "L'email è obbligatoria").email('Email non valida'),
  password: z.string().min(6, 'La password deve avere almeno 6 caratteri'),
})

type FormValues = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [registerUser, { isLoading }] = useRegisterMutation()
  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      const auth = await registerUser(values).unwrap()
      dispatch(setAuth(auth))
      toast.success(`Benvenuto a bordo, ${auth.username}!`)
      navigate('/catalogo')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Registrazione non riuscita'))
    }
  }

  return (
    <div className="cs-auth">
      <motion.form
        className="cs-auth__card pixel-panel pixel-corners"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        initial={{ opacity: 0, y: 20, rotate: 1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1>Registrati</h1>

        <div className="cs-auth__field">
          <label htmlFor="username">Username</label>
          <input id="username" type="text" autoComplete="username" {...registerField('username')} />
          {errors.username && <span className="cs-auth__field-error">{errors.username.message}</span>}
        </div>

        <div className="cs-auth__field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" autoComplete="email" {...registerField('email')} />
          {errors.email && <span className="cs-auth__field-error">{errors.email.message}</span>}
        </div>

        <div className="cs-auth__field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="new-password" {...registerField('password')} />
          {errors.password && <span className="cs-auth__field-error">{errors.password.message}</span>}
        </div>

        <PixelButton type="submit" className="cs-auth__submit" disabled={isLoading}>
          {isLoading ? 'Creazione...' : 'Crea account'}
        </PixelButton>

        <p className="cs-auth__switch">
          Hai già un account? <Link to="/login">Accedi</Link>
        </p>
      </motion.form>
    </div>
  )
}
