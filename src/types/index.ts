export interface BillItem {
  title: string
  quantity: number
  price: number
}

// Frontend-friendly status. Mapped from backend (open|paid|completed|expired for bills,
// pending|succeeded|failed|cancelled for payments).
export type StatusLabel = 'Completed' | 'Active' | 'Pending' | 'Failed' | 'Expired'

// A row in the user's payment history (from GET /api/payments/user)
export interface PaymentHistoryItem {
  paymentId: number
  billId: number
  amount: number
  status: StatusLabel
  rawStatus: 'pending' | 'succeeded' | 'failed' | 'cancelled'
  paidAt: string | null
  createdAt: string
  billTitle: string
  currency: string
  billToken: string
  merchantName: string
  contributorsCount: number
}

// Detailed bill from GET /api/bills/:id?token=
export interface BillDetail {
  id: number
  title: string
  amount: number
  fees: number
  currency: string
  items: BillItem[]
  status: 'open' | 'paid' | 'completed' | 'expired'
  paidAmount: number
  pendingAmount: number
  remaining: number
  createdAt: string
  expiresAt: string
  token: string
  merchantName?: string
  contributors: BillContributor[]
}

export interface AuthUser {
  id: number
  username: string | null
  email: string
}

export interface Receipt {
  amount: number
  title: string
  merchant: string
  date: string
  txn: string
  currency: string
  items: BillItem[]
  status: 'succeeded' | 'failed'
  contributors: BillContributor[]
}

export interface UserPreferences {
  notifications: boolean
  biometrics: boolean
  language: string
}

export interface BillContributor {
  name: string
  amount: number
}
