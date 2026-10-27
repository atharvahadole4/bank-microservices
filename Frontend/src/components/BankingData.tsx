import type { Customer, CustomerStatus } from '../types/banking'
import { getInitials } from '../data/formatting'
import Icon from './Icon'

export function CustomerTable({
  customers,
  compact = false,
  onSelect,
}: {
  customers: Customer[]
  compact?: boolean
  onSelect?: (customer: Customer) => void
}) {
  return (
    <table className={compact ? 'data-table compact-table' : 'data-table'}>
      <thead><tr><th>CUSTOMER</th><th>CUSTOMER ID</th><th>PHONE</th><th>JOINED</th><th>STATUS</th>{!compact && <th aria-label="Actions" />}</tr></thead>
      <tbody>
        {customers.map((customer) => (
          <tr key={customer.id} onClick={() => onSelect?.(customer)} className={onSelect ? 'clickable-row' : ''}>
            <td><span className="customer-cell"><span className="table-avatar">{getInitials(customer.name)}</span><span>{customer.name}<small>{customer.email}</small></span></span></td>
            <td className="id-cell">CUS-{customer.id}</td>
            <td>{customer.phone}</td>
            <td>{customer.joined}</td>
            <td><StatusBadge status={customer.status} /></td>
            {!compact && <td><button className="row-action" type="button" aria-label={`View ${customer.name}`} onClick={(event) => { event.stopPropagation(); onSelect?.(customer) }}>···</button></td>}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export function StatusBadge({ status }: { status: CustomerStatus }) {
  return <span className={`status-badge ${status.toLowerCase()}`}><i />{status}</span>
}

export function EmptyState({ text }: { text: string }) {
  return <div className="empty-state"><Icon name="search" /><span>{text}</span></div>
}
