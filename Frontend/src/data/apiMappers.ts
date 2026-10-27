import type { Customer, SavingsAccount } from '../types/banking'

function asRecord(value: unknown): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('The banking service returned an unexpected response.')
  }
  return value as Record<string, unknown>
}

function textField(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'string' || typeof value === 'number') {
      return String(value)
    }
  }
  return ''
}

function numberField(record: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key]
    if (typeof value === 'number' && Number.isFinite(value)) return value
    if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) {
      return Number(value)
    }
  }
  return undefined
}

export function mapApiCustomer(value: unknown): Customer {
  const record = asRecord(value)
  const id = numberField(record, 'customerId', 'id')
  const name = textField(record, 'name', 'customerName')
  if (id === undefined || !name) {
    throw new Error('Customer response is missing its customer ID or name.')
  }
  return {
    id,
    name,
    email: textField(record, 'email'),
    phone: textField(record, 'mobile', 'phone'),
    dateOfBirth: textField(record, 'dateOfBirth'),
    gender: textField(record, 'gender'),
    city: textField(record, 'city'),
    status: 'Active',
    joined: textField(record, 'createdAt', 'joined') || '—',
  }
}

export function mapApiSavings(
  value: unknown,
  fallbackCustomer?: { id: number; name: string },
): SavingsAccount {
  const record = asRecord(value)
  const id = numberField(record, 'savingsId', 'accountId', 'accountno', 'id')
  const customerId = numberField(record, 'customerId') ?? fallbackCustomer?.id
  const balance = numberField(record, 'balance')
  if (id === undefined || customerId === undefined || balance === undefined) {
    throw new Error('Savings response is missing its account ID, customer ID, or balance.')
  }
  return {
    id,
    customerId,
    customerName: textField(record, 'customerName') || fallbackCustomer?.name || `Customer ${customerId}`,
    accountNumber: textField(record, 'accountno', 'accountNumber') || `•••• ${String(id).slice(-4)}`,
    accountType: textField(record, 'accountType', 'type') || 'Savings',
    balance,
    openingDate: textField(record, 'openingDate'),
    status: 'Active',
  }
}
