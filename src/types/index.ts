export interface BillItem {
  qty: number
  name: string
  price: number
}

export interface Contributor {
  id: string
  name: string
  amount: number
  paid: boolean
  time: string
}

export interface Bill {
  id: string
  title: string
  merchant: string
  time: string
  date: string
  amount: number
  status: 'Completed' | 'Pending' | 'Failed' | 'Expired'
  peopleCount: number
  total: number
  contributed: number
  userShare: number
  code: string
  items: BillItem[]
  subtotal: number
  tax: number
  contributors: Contributor[]
}

export interface User {
  name: string
  email: string
  totalContributed: number
  billsPaid: number
  activeBills: number
}

export interface Receipt {
  amount: number
  title: string
  merchant: string
  date: string
  txn: string
}

export interface PaymentResponse {
  paymentId: string
  checkoutUrl: string
  status: string
}

export interface UserPreferences {
  notifications: boolean
  biometrics: boolean
  language: string
}
