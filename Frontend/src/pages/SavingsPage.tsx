import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { EmptyState } from '../components/BankingData'
import Icon from '../components/Icon'
import { mapApiSavings } from '../data/apiMappers'
import { currency } from '../data/formatting'
import {
  createSavings,
  getCustomerSavingsSummary,
  getSavingsProfile,
  type SavingsRequest,
} from '../services/bankingService'
import type { AdminOutletContext } from '../types/banking'

export default function SavingsPage() {
  const { admin } = useOutletContext<AdminOutletContext>()
  const [query, setQuery] = useState('')
  const [apiProfile, setApiProfile] = useState<ReturnType<typeof mapApiSavings> | null>(null)
  const [summaryId, setSummaryId] = useState('')
  const [summary, setSummary] = useState<ReturnType<typeof mapApiSavings> | null>(null)
  const [apiError, setApiError] = useState('')
  const [apiLoading, setApiLoading] = useState(true)
  const filtered = apiProfile
    && `${apiProfile.customerId} ${apiProfile.accountNumber} ${apiProfile.id}`.toLowerCase().includes(query.toLowerCase())
    ? [apiProfile]
    : []

  async function loadProfile() {
    setApiError('')
    setApiLoading(true)
    try {
      setApiProfile(mapApiSavings(await getSavingsProfile(admin.token)))
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to load savings profile.')
    } finally {
      setApiLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    getSavingsProfile(admin.token)
      .then((response) => {
        if (active) setApiProfile(mapApiSavings(response))
      })
      .catch((error: unknown) => {
        if (active) setApiError(error instanceof Error ? error.message : 'Unable to load savings profile.')
      })
      .finally(() => {
        if (active) setApiLoading(false)
      })
    return () => { active = false }
  }, [admin.token])

  async function loadSummary(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const customerId = Number(summaryId)
    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      setApiError('Enter a valid positive customer ID.')
      return
    }

    setApiError('')
    setApiLoading(true)
    try {
      const response = await getCustomerSavingsSummary(admin.token, customerId)
      setSummary(mapApiSavings(response, { id: customerId, name: `Customer ${customerId}` }))
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Unable to load savings summary.')
    } finally {
      setApiLoading(false)
    }
  }

  return (
    <div className="content-inner">
      <div className="page-heading">
        <div><span className="section-kicker">SAVINGS SERVICE</span><h1>Savings accounts</h1><p>Savings profile data loaded from the Savings Service API.</p></div>
        <Link className="admin-primary" to="/savings/new"><Icon name="plus" /> Create savings</Link>
      </div>

      <section className="admin-card api-tools-card">
        <div className="api-tools-copy"><strong>Savings service</strong><span>Showing the current profile; look up a customer’s savings summary by ID.</span></div>
        <div className="api-tools-actions">
          <form className="api-id-lookup" onSubmit={loadSummary}>
            <input aria-label="Customer ID for savings summary" type="number" min="1" value={summaryId} onChange={(event) => setSummaryId(event.target.value)} placeholder="Customer ID" required />
            <button className="admin-secondary" type="submit" disabled={apiLoading}>{apiLoading ? 'Loading…' : 'Get summary'}</button>
          </form>
          <button className="admin-secondary" type="button" onClick={loadProfile} disabled={apiLoading}>{apiLoading ? 'Loading…' : 'Load profile'}</button>
        </div>
        {apiError && <div className="api-inline-error" role="alert">{apiError}</div>}
      </section>

      {summary !== null && (
        <section className="api-result-card">
          <div><span className="section-kicker">API RESPONSE</span><strong>Savings summary · Customer #{summaryId}</strong></div>
          <span>Account #{summary.id}</span>
          <strong>{currency(summary.balance)}</strong>
          {summary.openingDate && <span>Opened {summary.openingDate}</span>}
        </section>
      )}

      <section className="admin-card full-table-card">
        <div className="list-toolbar">
          <div className="list-heading"><strong>Savings profile</strong><span>{filtered.length} API record{filtered.length === 1 ? '' : 's'}</span></div>
          <div className="list-filters">
            <label className="search-control"><Icon name="search" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search accounts" aria-label="Search accounts" /></label>
          </div>
        </div>
        <div className="demo-data-label">LIVE SAVINGS SERVICE RESPONSE · THIS API PROVIDES A PROFILE, NOT AN ACCOUNT LIST</div>
        {apiError && !apiProfile && !apiLoading && (
          <div className="api-inline-error" role="alert">{apiError}</div>
        )}
        {filtered.length > 0 ? (
          <table className="data-table savings-table">
            <thead><tr><th>ACCOUNT NO</th><th>CUSTOMER ID</th><th>OPENING DATE</th><th>BALANCE</th></tr></thead>
            <tbody>{filtered.map((account) => <tr key={account.id}><td>{account.accountNumber}</td><td className="id-cell">CUS-{account.customerId}</td><td>{account.openingDate || '—'}</td><td className="balance-cell">{currency(account.balance)}</td></tr>)}</tbody>
          </table>
        ) : <EmptyState text={apiLoading ? 'Loading savings data from the service…' : apiError ? 'Unable to display savings data. Check the service connection.' : 'No savings profile returned from the service.'} />}
        <div className="table-pagination"><span>Showing <strong>{filtered.length}</strong> API record{filtered.length === 1 ? '' : 's'}</span><div><button type="button" disabled aria-label="Previous page">←</button><button className="current-page" type="button">1</button><button type="button" disabled aria-label="Next page">→</button></div></div>
      </section>
    </div>
  )
}

export function NewSavingsPage() {
  const { admin, customers, addSavings, notify } = useOutletContext<AdminOutletContext>()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const customerId = Number(data.get('customerId'))
    const request: SavingsRequest = {
      customerId,
      openingDate: String(data.get('openingDate') ?? ''),
      balance: Number(data.get('balance')),
    }

    setError('')
    setSubmitting(true)
    try {
      const response = await createSavings(admin.token, request)
      const customer = customers.find((item) => item.id === customerId)
      const account = mapApiSavings(response, customer ? { id: customer.id, name: customer.name } : undefined)
      addSavings(account)
      notify(`Savings account ${account.id} created successfully.`)
      navigate('/savings')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create the savings account.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="content-inner">
      <div className="page-heading"><div><span className="section-kicker">SAVINGS SERVICE</span><h1>Create savings account</h1><p>Open a savings account for an existing customer through the Savings Service API.</p></div></div>
      <section className="admin-card form-page-card">
        {error && <div className="inline-error" role="alert">{error}</div>}
        <form className="route-form" onSubmit={submit}>
          <label className="modal-field"><span>Customer ID</span><input name="customerId" type="number" min="1" placeholder="Enter an existing customer ID" required /></label>
          <label className="modal-field"><span>Opening date</span><input name="openingDate" type="date" max={getTodayDate()} required /></label>
          <label className="modal-field"><span>Opening balance</span><input name="balance" type="number" min="0" step="0.01" placeholder="0.00" required /></label>
          <p className="form-hint">The customer must already exist. The Savings Service controls other account fields.</p>
          <div className="dialog-actions"><Link className="admin-secondary" to="/savings">Cancel</Link><button className="admin-primary" type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create account'}</button></div>
        </form>
      </section>
    </div>
  )
}

function getTodayDate() {
  const today = new Date()
  const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}
