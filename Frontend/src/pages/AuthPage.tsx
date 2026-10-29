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
          <span className="auth-kicker">VAULTCORE BANKING CORE · v2.5</span>
          <h1>Cloud-Native Banking,<br />Engineered for Scale.</h1>
          <p>Next-generation distributed microservices ledger managing real-time customer identities, savings portfolios, and secure transactions.</p>
          <div className="auth-visual-points">
            <span><i>✓</i> Spring Cloud Gateway & Dynamic Routing</span>
            <span><i>✓</i> Eureka Discovery & Health Registry</span>
            <span><i>✓</i> Stateless JWT 256-Bit Authentication</span>
            <span><i>✓</i> High-Throughput Customer & Savings Services</span>
          </div>
        </div>
        <div className="auth-visual-foot">
          <span>SECURE CORE NODE: 8765</span>
          <span>EUREKA MESH: ACTIVE</span>
        </div>
        <div className="visual-orb visual-orb-one" /><div className="visual-orb visual-orb-two" />
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <div className="mobile-brand"><Brand /></div>
          <div className="auth-switch" role="tablist" aria-label="Admin access">
            <Link className={mode === 'login' ? 'auth-switch-btn active' : 'auth-switch-btn'} role="tab" aria-selected={mode === 'login'} to="/login">Console Login</Link>
            <Link className={mode === 'register' ? 'auth-switch-btn active' : 'auth-switch-btn'} role="tab" aria-selected={mode === 'register'} to="/register">Create Admin</Link>
          </div>
          <span className="section-kicker">{mode === 'login' ? 'AUTHENTICATION GATEWAY' : 'ACCESS PROVISIONING'}</span>
          <h2>{mode === 'login' ? 'Sign in to VaultCore' : 'Register Administrator'}</h2>
          <p className="auth-description">{mode === 'login' ? 'Enter your credentials to access the banking microservices operations console.' : 'Provision a new administrator account with role-based access control.'}</p>
          {error && <div className="inline-error" role="alert">{error}</div>}
          <form className="auth-fields" onSubmit={submit}>
            <AuthField label="Admin Username" name="username" placeholder="e.g. admin" autoComplete="username" required />
            {mode === 'register' && <AuthField label="Work Email" name="email" type="email" placeholder="admin@vaultcore.com" autoComplete="email" />}
            <AuthField label="Master Password" name="password" type="password" placeholder="••••••••" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required />
            {mode === 'register' && <AuthField label="Confirm Password" name="confirmPassword" type="password" placeholder="••••••••" autoComplete="new-password" required />}
            <button className="admin-primary auth-submit" type="submit" disabled={submitting}>
              {submitting ? 'Authenticating with Gateway…' : mode === 'login' ? 'Enter Banking Console' : 'Provision Admin Account'}
              {!submitting && <span>→</span>}
            </button>
          </form>
          <p className="demo-warning"><Icon name="shield" /> Protected with SHA-256 JWT & Spring Security filter chains.</p>
        </div>
        <footer className="auth-copyright">© {new Date().getFullYear()} VaultCore Financial Technologies · Microservices Cloud Architecture</footer>
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
