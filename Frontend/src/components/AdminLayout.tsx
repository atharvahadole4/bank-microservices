import { useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import Brand from './Brand'
import Icon from './Icon'
import type { Admin, Customer, SavingsAccount } from '../types/banking'

export default function AdminLayout({
  admin,
  customers,
  createdCustomers,
  savings,
  onSignOut,
  onCreateCustomer,
  onCreateSavings,
}: {
  admin: Admin
  customers: Customer[]
  createdCustomers: Customer[]
  savings: SavingsAccount[]
  onSignOut: () => void
  onCreateCustomer: (customer: Customer) => void
  onCreateSavings: (account: SavingsAccount) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notice, setNotice] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const currentPage = location.pathname.startsWith('/customers')
    ? 'Customers'
    : location.pathname.startsWith('/savings')
      ? 'Savings accounts'
      : 'Overview'

  function signOut() {
    onSignOut()
    navigate('/login', { replace: true })
  }

  return (
    <div className="admin-app">
      <aside className={menuOpen ? 'admin-sidebar sidebar-visible' : 'admin-sidebar'}>
        <Brand />
        <div className="sidebar-caption">ADMINISTRATION</div>
        <nav className="admin-nav" aria-label="Admin navigation">
          <AdminNavLink to="/" icon="grid" label="Overview" onClick={() => setMenuOpen(false)} />
          <AdminNavLink to="/customers" icon="users" label="Customers" count={customers.length} onClick={() => setMenuOpen(false)} />
          <AdminNavLink to="/savings" icon="wallet" label="Savings accounts" onClick={() => setMenuOpen(false)} />
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-service"><span className="service-pulse" /><span><strong>Banking services</strong><small>API status on overview</small></span></div>
          <button className="sidebar-signout" type="button" onClick={signOut}><Icon name="logout" /> Sign out</button>
          <small className="sidebar-version">NORTHSTAR ADMIN · 1.0</small>
        </div>
      </aside>
      {menuOpen && <button className="mobile-scrim" aria-label="Close menu" type="button" onClick={() => setMenuOpen(false)} />}

      <div className="admin-main">
        <header className="admin-topbar">
          <button className="mobile-menu" type="button" aria-label="Open navigation" onClick={() => setMenuOpen(true)}><span /><span /><span /></button>
          <div className="topbar-crumb"><span>Admin console</span><span>/</span><strong>{currentPage}</strong></div>
          <div className="topbar-right">
            <div className="environment-label"><span /> AUTHENTICATED</div>
            <button className="admin-profile" type="button" onClick={() => setNotice(`Signed in as ${admin.username}`)}>
              <span className="admin-avatar">{getInitials(admin.name)}</span>
              <span className="admin-profile-text"><strong>{admin.name}</strong><small>Administrator</small></span>
              <span className="profile-chevron">⌄</span>
            </button>
          </div>
        </header>
        <main className="admin-content">
          {notice && <div className="toast-notice" role="status"><span>✓</span>{notice}<button type="button" aria-label="Dismiss" onClick={() => setNotice('')}>×</button></div>}
          <Outlet context={{
            admin,
            customers,
            createdCustomers,
            savings,
            notify: setNotice,
            addCustomer: onCreateCustomer,
            addSavings: onCreateSavings,
          }} />
        </main>
      </div>
    </div>
  )
}

function AdminNavLink({
  to,
  icon,
  label,
  count,
  onClick,
}: {
  to: string
  icon: string
  label: string
  count?: number
  onClick: () => void
}) {
  return (
    <NavLink to={to} end={to === '/'} onClick={onClick} className={({ isActive }) => isActive ? 'side-nav-item active' : 'side-nav-item'}>
      <Icon name={icon} /><span>{label}</span>{count !== undefined && <small>{count}</small>}
    </NavLink>
  )
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).slice(0, 2).map((part) => part.charAt(0).toUpperCase()).join('')
}
