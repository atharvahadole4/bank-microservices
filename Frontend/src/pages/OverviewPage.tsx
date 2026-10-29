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
    ? 'Mesh Connected'
    : respondingServices === 0 && !Object.values(portStatus).some((status) => status.includes('Checking'))
      ? 'Mesh Degraded'
      : respondingServices === 0
        ? 'Syncing'
        : 'Active'

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
        <div>
          <span className="section-kicker">VAULTCORE ENTERPRISE OPS</span>
          <h1>Operations Command Center</h1>
          <p>Real-time telemetry and ledger metrics across all banking microservices.</p>
        </div>
        <div className="heading-actions">
          <Link className="admin-secondary" to="/customers/new"><Icon name="plus" /> Add Customer</Link>
          <Link className="admin-primary" to="/savings/new"><Icon name="plus" /> New Savings Ledger</Link>
        </div>
      </div>

      <div className="demo-data-label overview-demo-note">LIVE MICROSERVICES MESH · SPRING CLOUD GATEWAY :8765 · EUREKA DISCOVERY ACTIVE</div>
      <section className="stat-grid" aria-label="Banking service metrics">
        <MetricCard icon="users" label="Managed Customer Records" value={customers.length.toLocaleString()} delta="Active Identities" caption="synchronized" tint="blue" />
        <MetricCard icon="wallet" label="Active Savings Accounts" value={savings.length.toLocaleString()} delta={`${activeAccounts} verified`} caption="real-time" tint="green" />
        <MetricCard icon="coins" label="Total Reserve Balance" value={currency(totalDeposits)} delta="Settled Balances" caption="JPA managed" tint="violet" />
        <MetricCard icon="pulse" label="Cluster Health" value={healthLabel} delta={`${respondingServices} of 2 routes responding`} caption="Eureka discovery" tint="amber" />
      </section>

      <div className="overview-grid">
        <section className="admin-card customer-table-card">
          <div className="card-title-row">
            <div>
              <h2>Recent Customer Records</h2>
              <p>Active account holders in the banking registry</p>
            </div>
            <Link className="text-link" to="/customers">All Records <span>→</span></Link>
          </div>
          <CustomerTable customers={customers.slice(0, 4)} compact />
          <Link className="table-bottom-link" to="/customers">Open Full Customer Directory <span>→</span></Link>
        </section>
        <section className="admin-card service-card">
          <div className="card-title-row">
            <div>
              <h2>Microservices Telemetry</h2>
              <p>Dynamic routing through Spring Cloud Gateway</p>
            </div>
            <span className={`health-pill ${healthLabel.includes('Connected') || healthLabel.includes('Active') ? '' : 'health-pill-warning'}`}><i /> {healthLabel}</span>
          </div>
          <HealthService icon="users" title="Customer Service → Account Service" description="Internal Feign / RestTemplate route" status={portStatus.customerApi} />
          <HealthService icon="wallet" title="Account Microservice" description="Direct savings-service instance" status={portStatus.savingsService} />
          <div className="service-port"><span>Discovery Heartbeat</span><span><i /> Port 8761 Active</span></div>
          <Link className="service-link" to="/savings">Inspect Savings Accounts <span>→</span></Link>
        </section>
      </div>

      <section className="admin-card savings-summary-card">
        <div className="card-title-row">
          <div>
            <h2>Managed Savings Portfolio</h2>
            <p>Liquidity and reserve distribution across customer accounts</p>
          </div>
          <Link className="text-link" to="/savings">Portfolio Details <span>→</span></Link>
        </div>
        <div className="portfolio-row">
          <div className="portfolio-balance">
            <span>Aggregated Portfolio Balance</span>
            <strong>{currency(totalDeposits)}</strong>
            <small>Across {savings.length} managed savings accounts</small>
          </div>
          <div className="portfolio-chart" aria-label="Illustrative portfolio balance chart">
            {[34, 48, 38, 63, 51, 73, 56, 82, 68, 96, 78, 100].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}
          </div>
          <div className="portfolio-legend">
            <span><i className="legend-dot green-dot" />Verified Accounts <strong>{activeAccounts}</strong></span>
            <span><i className="legend-dot amber-dot" />Under Review <strong>{savings.length - activeAccounts}</strong></span>
          </div>
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
    return port ? `Port ${port} (UP)` : 'Responding (UP)'
  }
  return 'Responding (UP)'
}
