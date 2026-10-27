import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import { EmptyState } from '../components/BankingData'
import Icon from '../components/Icon'
import { mapApiCustomer, mapApiSavings } from '../data/apiMappers'
import { currency, getInitials } from '../data/formatting'
import {
  createCustomer,
  getCustomerById,
  getCustomerProfile,
  getCustomerSavingsSummary,
  getSavingsPortFromCustomerService,
  type CustomerRequest,
} from '../services/bankingService'
import type { AdminOutletContext, Customer } from '../types/banking'

export default function CustomersPage() {
  const { admin, createdCustomers } = useOutletContext<AdminOutletContext>()
  const [query, setQuery] = useState('')
  const [apiCustomers, setApiCustomers] = useState<Customer[]>(createdCustomers)
  const [selected, setSelected] = useState<Customer | null>(null)
  const [lookupId, setLookupId] = useState('')
  const [lookupError, setLookupError] = useState('')
  const [lookupLoading, setLookupLoading] = useState(true)
  const [summary, setSummary] = useState<ReturnType<typeof mapApiSavings> | null>(null)
  const [savingsPort, setSavingsPort] = useState('')
  const [endpointError, setEndpointError] = useState('')
  const [endpointLoading, setEndpointLoading] = useState(false)
  const filtered = useMemo(() => apiCustomers.filter((customer) => {
    return `${customer.name} ${customer.email} ${customer.phone} ${customer.id} ${customer.city ?? ''}`
      .toLowerCase()
      .includes(query.toLowerCase())
  }), [apiCustomers, query])

  async function loadProfile() {
    setLookupError('')
    setLookupLoading(true)
    try {
      const profile = mapApiCustomer(await getCustomerProfile(admin.token))
      setApiCustomers((current) => upsertCustomer(current, profile))
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Unable to load customer profile.')
    } finally {
      setLookupLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    getCustomerProfile(admin.token)
      .then((response) => {
        if (active) {
          const profile = mapApiCustomer(response)
          setApiCustomers((current) => upsertCustomer(current, profile))
        }
      })
      .catch((error: unknown) => {
        if (active) setLookupError(error instanceof Error ? error.message : 'Unable to load customer profile.')
      })
      .finally(() => {
        if (active) setLookupLoading(false)
      })
    return () => { active = false }
  }, [admin.token])

  async function loadCustomerById(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const customerId = Number(lookupId)
    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      setLookupError('Enter a valid positive customer ID.')
      return
    }

    setLookupError('')
    setLookupLoading(true)
    try {
      const customer = mapApiCustomer(await getCustomerById(admin.token, customerId))
      setApiCustomers((current) => upsertCustomer(current, customer))
    } catch (error) {
      setLookupError(error instanceof Error ? error.message : 'Unable to load this customer.')
    } finally {
      setLookupLoading(false)
    }
  }

  async function loadSavingsSummary() {
    const customerId = Number(lookupId)
    if (!Number.isSafeInteger(customerId) || customerId <= 0) {
      setEndpointError('Enter a valid positive customer ID to load its savings summary.')
      return
    }

    setEndpointError('')
    setSummary(null)
    setEndpointLoading(true)
    try {
      const response = await getCustomerSavingsSummary(admin.token, customerId)
      setSummary(mapApiSavings(response, { id: customerId, name: `Customer ${customerId}` }))
    } catch (error) {
      setEndpointError(error instanceof Error ? error.message : 'Unable to load the customer savings summary.')
    } finally {
      setEndpointLoading(false)
    }
  }

  async function loadSavingsPort() {
    setEndpointError('')
    setSavingsPort('')
    setEndpointLoading(true)
    try {
      const response = await getSavingsPortFromCustomerService(admin.token)
      if (typeof response !== 'string' || !response.trim()) {
        throw new Error('The customer service returned an unexpected savings-service status response.')
      }
      setSavingsPort(response)
    } catch (error) {
      setEndpointError(error instanceof Error ? error.message : 'Unable to check the Savings Service.')
    } finally {
      setEndpointLoading(false)
    }
  }

  return (
    <div className="content-inner">
      <div className="page-heading">
        <div><span className="section-kicker">CUSTOMER SERVICE</span><h1>Customers</h1><p>Customer profile data loaded from the Customer Service API.</p></div>
        <Link className="admin-primary" to="/customers/new"><Icon name="plus" /> Add customer</Link>
      </div>
      <section className="admin-card api-tools-card">
        <div className="api-tools-copy"><strong>Customer service</strong><span>Showing the current profile; look up another customer by ID.</span></div>
        <div className="api-tools-actions">
          <form className="api-id-lookup" onSubmit={loadCustomerById}>
            <input aria-label="Customer ID" type="number" min="1" value={lookupId} onChange={(event) => setLookupId(event.target.value)} placeholder="Customer ID" required />
            <button className="admin-secondary" type="submit" disabled={lookupLoading}>{lookupLoading ? 'Loading…' : 'Find by ID'}</button>
          </form>
          <button className="admin-secondary" type="button" onClick={loadProfile} disabled={lookupLoading}>{lookupLoading ? 'Loading…' : 'Load profile'}</button>
          <button className="admin-secondary" type="button" onClick={loadSavingsSummary} disabled={endpointLoading}>{endpointLoading ? 'Loading…' : 'Savings summary'}</button>
          <button className="admin-secondary" type="button" onClick={loadSavingsPort} disabled={endpointLoading}>{endpointLoading ? 'Checking…' : 'Check savings service'}</button>
        </div>
        {lookupError && <div className="api-inline-error" role="alert">{lookupError}</div>}
        {endpointError && <div className="api-inline-error" role="alert">{endpointError}</div>}
      </section>
      {summary && (
        <section className="api-result-card">
          <div><span className="section-kicker">GET /api/v1/customers/savings/{summary.customerId}</span><strong>Customer savings summary</strong></div>
          <span>Account #{summary.accountNumber}</span>
          <strong>{currency(summary.balance)}</strong>
          {summary.openingDate && <span>Opened {summary.openingDate}</span>}
        </section>
      )}
      {savingsPort && (
        <section className="api-result-card">
          <div><span className="section-kicker">GET /api/v1/customers/savings/port</span><strong>Savings Service status</strong></div>
          <span>{savingsPort}</span>
        </section>
      )}
      <section className="admin-card full-table-card">
        <div className="list-toolbar">
          <div className="list-heading"><strong>Customer data</strong><span>{filtered.length} service record{filtered.length === 1 ? '' : 's'}</span></div>
          <div className="list-filters">
            <label className="search-control"><Icon name="search" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search customers" aria-label="Search customers" /></label>
          </div>
        </div>
        <div className="demo-data-label">CUSTOMERS CREATED OR LOOKED UP THROUGH THE API · NO LIST-ALL ENDPOINT IS AVAILABLE</div>
        {lookupLoading && apiCustomers.length === 0
          ? <EmptyState text="Loading customer data from the service…" />
          : filtered.length > 0
            ? <table className="data-table">
              <thead><tr><th>CUSTOMER ID</th><th>NAME</th><th>EMAIL</th><th>MOBILE</th><th>DATE OF BIRTH</th><th>GENDER</th><th>CITY</th></tr></thead>
              <tbody>{filtered.map((customer) => <tr key={customer.id} className="clickable-row" onClick={() => setSelected(customer)}>
                <td className="id-cell">CUS-{customer.id}</td>
                <td>{customer.name}</td>
                <td>{customer.email || '—'}</td>
                <td>{customer.phone || '—'}</td>
                <td>{customer.dateOfBirth || '—'}</td>
                <td>{customer.gender || '—'}</td>
                <td>{customer.city || '—'}</td>
              </tr>)}</tbody>
            </table>
            : <EmptyState text={lookupError ? 'Unable to display customer data. Check the service connection or search for a customer ID.' : 'No customer data returned from the service.'} />}
        <div className="table-pagination"><span>Showing <strong>{filtered.length}</strong> service record{filtered.length === 1 ? '' : 's'}</span><div><button type="button" disabled aria-label="Previous page">←</button><button className="current-page" type="button">1</button><button type="button" disabled aria-label="Next page">→</button></div></div>
      </section>
      <section className="admin-card api-tools-card customer-loans-note">
        <div className="api-tools-copy"><strong>Loans endpoint</strong><span>GET /api/v1/customers/loans/{'{customerid}'} is present in the controller but currently returns null, so no loan data is shown.</span></div>
        <span className="endpoint-unavailable">Not implemented</span>
      </section>
      {selected && <CustomerDetail customer={selected} onClose={() => setSelected(null)} />}
    </div>
  )
}

function upsertCustomer(customers: Customer[], customer: Customer) {
  return [customer, ...customers.filter((item) => item.id !== customer.id)]
}

function CustomerDetail({ customer, onClose }: { customer: Customer; onClose: () => void }) {
  return (
    <div className="modal-backdrop" role="presentation" onClick={onClose}>
      <section className="detail-drawer" role="dialog" aria-modal="true" aria-label="Customer details" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-heading"><div><span className="section-kicker">CUSTOMER PROFILE</span><h2>Customer details</h2></div><button type="button" className="close-button" onClick={onClose} aria-label="Close">×</button></div>
        <div className="drawer-customer"><span className="table-avatar large-avatar">{getInitials(customer.name)}</span><span><strong>{customer.name}</strong><small>CUS-{customer.id}</small></span></div>
        <Detail label="Email address" value={customer.email} />
        <Detail label="Phone number" value={customer.phone} />
        {customer.dateOfBirth && <Detail label="Date of birth" value={customer.dateOfBirth} />}
        {customer.gender && <Detail label="Gender" value={customer.gender} />}
        {customer.city && <Detail label="City" value={customer.city} />}
        <div className="drawer-note"><Icon name="info" /> This record was created or retrieved through the Customer Service API.</div>
        <button className="admin-primary drawer-action" type="button" onClick={onClose}>Done</button>
      </section>
    </div>
  )
}

export function NewCustomerPage() {
  const { admin, addCustomer, notify } = useOutletContext<AdminOutletContext>()
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const customerRequest: CustomerRequest = {
      name: String(data.get('name') ?? '').trim(),
      email: String(data.get('email') ?? '').trim(),
      mobile: String(data.get('mobile') ?? '').trim(),
      dateOfBirth: String(data.get('dateOfBirth') ?? ''),
      gender: String(data.get('gender') ?? '') as CustomerRequest['gender'],
      city: String(data.get('city') ?? '').trim(),
    }

    setError('')
    setSubmitting(true)
    try {
      const createdCustomer = mapApiCustomer(await createCustomer(admin.token, customerRequest))
      addCustomer(createdCustomer)
      notify(`Customer ${createdCustomer.id} created successfully.`)
      navigate('/customers')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to create the customer.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="content-inner">
      <div className="page-heading"><div><span className="section-kicker">CUSTOMER SERVICE</span><h1>Add customer</h1><p>Create a customer profile through the Customer Service API.</p></div></div>
      <section className="admin-card form-page-card">
        {error && <div className="inline-error" role="alert">{error}</div>}
        <form className="route-form" onSubmit={submit}>
          <FormField label="Full name" name="name" placeholder="Customer full name" minLength={2} maxLength={50} pattern="[A-Za-z ]+" required />
          <FormField label="Email address" name="email" type="email" placeholder="name@example.com" maxLength={100} required />
          <FormField label="Mobile number" name="mobile" type="tel" placeholder="10-digit Indian mobile number" pattern="[6-9][0-9]{9}" maxLength={10} required />
          <FormField label="Date of birth" name="dateOfBirth" type="date" max={getLatestAdultBirthDate()} required />
          <label className="modal-field"><span>Gender</span><select name="gender" defaultValue="" required><option value="" disabled>Select gender</option><option value="MALE">Male</option><option value="FEMALE">Female</option><option value="OTHER">Other</option></select></label>
          <FormField label="City" name="city" placeholder="Customer city" minLength={2} maxLength={60} pattern="[A-Za-z][A-Za-z .,'-]*" required />
          <p className="form-hint">Customer must be at least 18 years old. Server-side validation remains authoritative.</p>
          <div className="dialog-actions"><Link className="admin-secondary" to="/customers">Cancel</Link><button className="admin-primary" type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create customer'}</button></div>
        </form>
      </section>
    </div>
  )
}

function FormField({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  minLength,
  maxLength,
  pattern,
  min,
  max,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: string
  min?: string
  max?: string
}) {
  return <label className="modal-field"><span>{label}</span><input name={name} type={type} placeholder={placeholder} required={required} minLength={minLength} maxLength={maxLength} pattern={pattern} min={min} max={max} /></label>
}

function Detail({ label, value }: { label: string; value: string }) {
  return <div className="drawer-detail"><span>{label}</span><strong>{value}</strong></div>
}

function getLatestAdultBirthDate() {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 18)
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 10)
}
