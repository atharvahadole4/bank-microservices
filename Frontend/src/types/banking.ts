export type Admin = {
  name: string
  username: string
  token: string
}

export type CustomerStatus = 'Active' | 'Pending'

export type Customer = {
  id: number
  name: string
  email: string
  phone: string
  dateOfBirth?: string
  gender?: string
  city?: string
  status: CustomerStatus
  joined: string
}

export type SavingsAccount = {
  id: number
  customerId: number
  customerName: string
  accountNumber: string
  accountType: string
  balance: number
  openingDate?: string
  status: CustomerStatus
}

export type AdminOutletContext = {
  admin: Admin
  customers: Customer[]
  createdCustomers: Customer[]
  savings: SavingsAccount[]
  notify: (message: string) => void
  addCustomer: (customer: Customer) => void
  addSavings: (account: SavingsAccount) => void
}
