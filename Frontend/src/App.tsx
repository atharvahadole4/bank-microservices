import { useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './components/AdminLayout'
import { initialCustomers, initialSavings } from './data/mockData'
import AuthPage from './pages/AuthPage'
import CustomersPage, { NewCustomerPage } from './pages/CustomersPage'
import OverviewPage from './pages/OverviewPage'
import SavingsPage, { NewSavingsPage } from './pages/SavingsPage'
import type { Admin, Customer, SavingsAccount } from './types/banking'

function App() {
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [customers, setCustomers] = useState(initialCustomers)
  const [createdCustomers, setCreatedCustomers] = useState<Customer[]>([])
  const [savings, setSavings] = useState(initialSavings)

  return (
    <Routes>
      <Route
        path="/login"
        element={admin ? <Navigate to="/" replace /> : <AuthPage mode="login" onSignIn={setAdmin} />}
      />
      <Route
        path="/register"
        element={admin ? <Navigate to="/" replace /> : <AuthPage mode="register" onSignIn={setAdmin} />}
      />
      <Route
        path="/"
        element={
          admin ? (
            <AdminLayout
              admin={admin}
              customers={customers}
              createdCustomers={createdCustomers}
              savings={savings}
              onSignOut={() => setAdmin(null)}
              onCreateCustomer={(customer) => {
                setCustomers((current) => [customer, ...current])
                setCreatedCustomers((current) => [customer, ...current.filter((item) => item.id !== customer.id)])
              }}
              onCreateSavings={(account) => setSavings((current) => [account, ...current])}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<OverviewPage />} />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="customers/new" element={<NewCustomerPage />} />
        <Route path="savings" element={<SavingsPage />} />
        <Route path="savings/new" element={<NewSavingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to={admin ? '/' : '/login'} replace />} />
    </Routes>
  )
}

export default App

export type { Admin, Customer, SavingsAccount }
