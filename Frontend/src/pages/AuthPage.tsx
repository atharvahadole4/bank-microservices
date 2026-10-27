import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Brand from '../components/Brand'
import Icon from '../components/Icon'
import { getAuthToken, registerAdmin, validateAuthToken } from '../services/authService'
import type { Admin } from '../types/banking'

export default function AuthPage({
  mode,
  onSignIn,
}: {
  mode: 'login' | 'register'
  onSignIn: (admin: Admin) => void
}) {
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const data = new FormData(event.currentTarget)
    const username = String(data.get('username') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const password = String(data.get('password') ?? '')

    let registered = false
    try {
      if (mode === 'register') {
        if (password !== data.get('confirmPassword')) {
          setError('Passwords do not match.')
          return
        }
        await registerAdmin(username, password, email)
        registered = true
      }

      const token = await getAuthToken(username, password)
      await validateAuthToken(token)
      const firstName = username.split(/[._-]/)[0] || 'Admin'
      const name = `${firstName.charAt(0).toUpperCase()}${firstName.slice(1)} Admin`
      onSignIn({ name, username, token })
      navigate('/', { replace: true })
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : 'Authentication failed. Please try again.'
      setError(registered ? `Your account was created, but sign-in failed: ${message} You can try signing in now.` : message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="admin-auth">
      <section className="auth-visual">
        <Brand light />
        <div className="auth-visual-copy">
          <span className="auth-kicker">NORTHSTAR BANK · ADMINISTRATION</span>
          <h1>Banking operations,<br />beautifully in balance.</h1>
          <p>A clear workspace to oversee customer records and savings accounts.</p>
          <div className="auth-visual-points">
            <span><i>✓</i> Customer directory</span>
            <span><i>✓</i> Savings oversight</span>
            <span><i>✓</i> Operational insights</span>
          </div>
        </div>
        <div className="auth-visual-foot"><span>ADMIN CONSOLE</span><span>SECURE WORKSPACE</span></div>
        <div className="visual-orb visual-orb-one" /><div className="visual-orb visual-orb-two" />
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="mobile-brand"><Brand /></div>
          <div className="auth-switch" role="tablist" aria-label="Admin access">
            <Link className={mode === 'login' ? 'auth-switch-btn active' : 'auth-switch-btn'} role="tab" aria-selected={mode === 'login'} to="/login">Admin sign in</Link>
            <Link className={mode === 'register' ? 'auth-switch-btn active' : 'auth-switch-btn'} role="tab" aria-selected={mode === 'register'} to="/register">Create admin</Link>
          </div>
          <span className="section-kicker">{mode === 'login' ? 'WELCOME BACK' : 'NEW ADMIN ACCESS'}</span>
          <h2>{mode === 'login' ? 'Sign in to Admin' : 'Create admin account'}</h2>
          <p className="auth-description">{mode === 'login' ? 'Manage customers and accounts from your operations dashboard.' : 'Register an administrator account to continue.'}</p>
          {error && <div className="inline-error" role="alert">{error}</div>}
          <form className="auth-fields" onSubmit={submit}>
            <AuthField label="Username" name="username" placeholder="Enter your username" autoComplete="username" required />
            {mode === 'register' && <AuthField label="Email" name="email" type="email" placeholder="Enter email (optional)" autoComplete="email" />}
            <AuthField label="Password" name="password" type="password" placeholder="Enter password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
            {mode === 'register' && <AuthField label="Confirm password" name="confirmPassword" type="password" placeholder="Re-enter password" autoComplete="new-password" required />}
            <button className="admin-primary auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Please wait…' : mode === 'login' ? 'Sign in to console' : 'Create admin account'}
              {!submitting && <span>→</span>}
            </button>
          </form>
          <p className="demo-warning"><Icon name="lock" /> Securely connected to the authentication service.</p>
        </div>
        <footer className="auth-copyright">© {new Date().getFullYear()} Northstar Bank · Admin Console</footer>
      </section>
    </main>
  )
}

function AuthField({
  label,
  name,
  type = 'text',
  placeholder,
  autoComplete,
  required = false,
}: {
  label: string
  name: string
  type?: string
  placeholder: string
  autoComplete?: string
  required?: boolean
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      <input name={name} type={type} placeholder={placeholder} autoComplete={autoComplete} required={required} />
    </label>
  )
}
