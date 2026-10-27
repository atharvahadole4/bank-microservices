import { useEffect, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import { CustomerTable } from '../components/BankingData'
import { currency } from '../data/formatting'
import Icon from '../components/Icon'
import { getSavingsPortFromCustomerService, getSavingsServicePort } from '../services/bankingService'
import type { AdminOutletContext } from '../types/banking'

export default function OverviewPage() {
  const { admin, customers, savings } = useOutletContext<AdminOutletContext>()
  const [portStatus, setPortStatus] = useState({
    customerApi: 'Checking…',
    savingsService: 'Checking…',
  })
  const totalDeposits = savings.reduce((sum, account) => sum + account.balance, 0)
  const activeAccounts = savings.filter((account) => account.status === 'Active').length
  const respondingServices = Object.values(portStatus).filter(
    (status) => !status.includes('unavailable') && !status.includes('Checking'),
  ).length
  const healthLabel = respondingServices === 2
    ? 'Connected'
    : respondingServices === 0 && !Object.values(portStatus).some((status) => status.includes('Checking'))
      ? 'Unavailable'
      : respondingServices === 0
        ? 'Checking'
        : 'Degraded'

  useEffect(() => {
    let active = true
    Promise.allSettled([
      getSavingsPortFromCustomerService(admin.token),
      getSavingsServicePort(admin.token),
    ]).then(([customerPort, savingsPort]) => {
      if (!active) return
      setPortStatus({
        customerApi: getPortLabel(customerPort, 'Customer API'),
        savingsService: getPortLabel(savingsPort, 'Savings Service'),
      })
    })
    return () => { active = false }
  }, [admin.token])

  return (
    <div className="content-inner">
      <div className="page-heading">
        <div><span className="section-kicker">BANK OPERATIONS</span><h1>Good morning, Admin</h1><p>Here’s what’s happening across your banking services today.</p></div>
        <div className="heading-actions"><Link className="admin-secondary" to="/customers/new"><Icon name="plus" /> Add customer</Link><Link className="admin-primary" to="/savings/new"><Icon name="plus" /> New savings account</Link></div>
      </div>

      <div className="demo-data-label overview-demo-note">LOCAL DASHBOARD TOTALS AND DIRECTORY · CUSTOMER AND SAVINGS SERVICES DO NOT EXPOSE LIST-ENDPOINTS</div>
      <section className="stat-grid" aria-label="Banking service metrics">
        <MetricCard icon="users" label="Local customer records" value={customers.length.toLocaleString()} delta="In this session" caption="not a service total" tint="blue" />
        <MetricCard icon="wallet" label="Savings records" value={savings.length.toLocaleString()} delta={`${activeAccounts} active`} caption="local directory data" tint="green" />
        <MetricCard icon="coins" label="Recorded deposits" value={currency(totalDeposits)} delta="Local data" caption="not a service total" tint="violet" />
        <MetricCard icon="pulse" label="Service status" value={healthLabel} delta={`${respondingServices} of 2 checks responding`} caption="Live API health checks" tint="amber" />
      </section>

      <div className="overview-grid">
        <section className="admin-card customer-table-card">
          <div className="card-title-row"><div><h2>Recent customers</h2><p>Customer records in this session’s local directory</p></div><Link className="text-link" to="/customers">View all <span>→</span></Link></div>
          <CustomerTable customers={customers.slice(0, 4)} compact />
          <Link className="table-bottom-link" to="/customers">Open customer directory <span>→</span></Link>
        </section>
        <section className="admin-card service-card">
          <div className="card-title-row"><div><h2>Service health</h2><p>Savings service checked through two routes</p></div><span className={`health-pill ${healthLabel === 'Connected' ? '' : 'health-pill-warning'}`}><i /> {healthLabel}</span></div>
          <HealthService icon="users" title="Customer API → Savings" description="Savings health via the customer service" status={portStatus.customerApi} />
          <HealthService icon="wallet" title="Savings service" description="Direct savings-service health" status={portStatus.savingsService} />
          <div className="service-port"><span>Service health endpoints</span><span><i /> Live check</span></div>
          <Link className="service-link" to="/savings">Review savings accounts <span>→</span></Link>
        </section>
      </div>

      <section className="admin-card savings-summary-card">
        <div className="card-title-row"><div><h2>Savings portfolio</h2><p>Account balances across your customer base</p></div><Link className="text-link" to="/savings">Manage accounts <span>→</span></Link></div>
        <div className="portfolio-row">
          <div className="portfolio-balance"><span>Total savings balance</span><strong>{currency(totalDeposits)}</strong><small>Across {savings.length} accounts</small></div>
          <div className="portfolio-chart" aria-label="Illustrative portfolio balance chart">{[34, 48, 38, 63, 51, 73, 56, 82, 68, 96, 78, 100].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
          <div className="portfolio-legend"><span><i className="legend-dot green-dot" />Active accounts <strong>{activeAccounts}</strong></span><span><i className="legend-dot amber-dot" />Pending review <strong>{savings.length - activeAccounts}</strong></span></div>
        </div>
      </section>
    </div>
  )
}

function MetricCard({ icon, label, value, delta, caption, tint }: { icon: string; label: string; value: string; delta: string; caption: string; tint: string }) {
  return <article className="metric-card"><div className={`metric-icon tint-${tint}`}><Icon name={icon} /></div><span className="metric-label">{label}</span><strong className="metric-value">{value}</strong><span className="metric-foot"><b className={tint === 'amber' ? 'neutral-delta' : ''}>{delta}</b><span>{caption}</span></span></article>
}

function HealthService({ icon, title, description, status }: { icon: string; title: string; description: string; status: string }) {
  const stateClass = status.includes('unavailable')
    ? 'health-error'
    : status.includes('Checking')
      ? 'health-pending'
      : ''
  return <div className="health-service"><span className="health-icon"><Icon name={icon} /></span><span className="health-copy"><strong>{title}</strong><small>{description}</small></span><span className={`health-ok ${stateClass}`}>{status}</span></div>
}

function getPortLabel(
  result: PromiseSettledResult<unknown>,
  serviceName: string,
) {
  if (result.status === 'rejected') {
    return `${serviceName} unavailable`
  }
  if (typeof result.value === 'string') {
    const port = result.value.match(/\bport:\s*(\d+)\b/i)?.[1]
    return port ? `Port ${port}` : 'Responding'
  }
  return 'Responding'
}
