import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useLoginMutation } from '../store/apiSlice'
import { useAppDispatch } from '../store/hooks'
import { setAuth } from '../store/authSlice'
import { getApiErrorMessage } from '../utils/errors'
import PixelButton from '../components/ui/PixelButton'
import './Auth.css'

const schema = z.object({
  usernameOrEmail: z.string().min(1, 'Username o email obbligatori'),
  password: z.string().min(1, 'La password è obbligatoria'),
})

type FormValues = z.infer<typeof schema>

export default function Login() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [login, { isLoading }] = useLoginMutation()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const onSubmit = async (values: FormValues) => {
    try {
      const auth = await login(values).unwrap()
      dispatch(setAuth(auth))
      toast.success(`Bentornato, ${auth.username}!`)
      navigate('/catalogo')
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Credenziali non valide'))
    }
  }

  return (
    <div className="cs-auth">
      <motion.form
        className="cs-auth__card pixel-panel pixel-corners"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        initial={{ opacity: 0, y: 20, rotate: -1 }}
        animate={{ opacity: 1, y: 0, rotate: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1>Login</h1>

        <div className="cs-auth__field">
          <label htmlFor="usernameOrEmail">Username o email</label>
          <input id="usernameOrEmail" type="text" autoComplete="username" {...register('usernameOrEmail')} />
          {errors.usernameOrEmail && <span className="cs-auth__field-error">{errors.usernameOrEmail.message}</span>}
        </div>

        <div className="cs-auth__field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" autoComplete="current-password" {...register('password')} />
          {errors.password && <span className="cs-auth__field-error">{errors.password.message}</span>}
        </div>

        <PixelButton type="submit" className="cs-auth__submit" disabled={isLoading}>
          {isLoading ? 'Accesso...' : 'Entra'}
        </PixelButton>

        <p className="cs-auth__switch">
          Non hai un account? <Link to="/registrati">Registrati</Link>
        </p>
      </motion.form>
    </div>
  )
}
