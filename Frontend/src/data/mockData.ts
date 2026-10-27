import type { Customer, SavingsAccount } from '../types/banking'

export const initialCustomers: Customer[] = [
  { id: 20481, name: 'Alex Morgan', email: 'alex.morgan@example.com', phone: '+1 (555) 014-8273', status: 'Active', joined: 'Oct 21, 2026' },
  { id: 20480, name: 'Taylor Brooks', email: 'taylor.brooks@example.com', phone: '+1 (555) 018-4402', status: 'Active', joined: 'Oct 20, 2026' },
  { id: 20479, name: 'Jordan Lee', email: 'jordan.lee@example.com', phone: '+1 (555) 011-2946', status: 'Pending', joined: 'Oct 19, 2026' },
  { id: 20478, name: 'Sam Rivera', email: 'sam.rivera@example.com', phone: '+1 (555) 019-8321', status: 'Active', joined: 'Oct 18, 2026' },
  { id: 20477, name: 'Casey Patel', email: 'casey.patel@example.com', phone: '+1 (555) 012-9088', status: 'Active', joined: 'Oct 17, 2026' },
]

export const initialSavings: SavingsAccount[] = [
  { id: 7001, customerId: 20481, customerName: 'Alex Morgan', accountNumber: '•••• 4829', accountType: 'Everyday Savings', balance: 24850.75, status: 'Active' },
  { id: 7002, customerId: 20480, customerName: 'Taylor Brooks', accountNumber: '•••• 1056', accountType: 'Growth Savings', balance: 12500, status: 'Active' },
  { id: 7003, customerId: 20479, customerName: 'Jordan Lee', accountNumber: '•••• 9314', accountType: 'Everyday Savings', balance: 8750.25, status: 'Pending' },
  { id: 7004, customerId: 20478, customerName: 'Sam Rivera', accountNumber: '•••• 2861', accountType: 'Premium Savings', balance: 41280.5, status: 'Active' },
]
