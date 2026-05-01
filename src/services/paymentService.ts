import { api } from './api'
import type { PaymentHistoryItem, StatusLabel } from '@/types'

interface RawUserPayment {
  id: number
  bill_id: number
  amount: string | number
  status: 'pending' | 'succeeded' | 'failed' | 'cancelled'
  paid_at: string | null
  created_at: string
  bill_title: string
  currency: string
  bill_token: string
  merchant_name: string
  contributors_count: number | string
}

function num(v: string | number | undefined | null): number {
  if (v == null) return 0
  return typeof v === 'string' ? parseFloat(v) : v
}

export function mapPaymentStatus(s: RawUserPayment['status']): StatusLabel {
  switch (s) {
    case 'succeeded': return 'Completed'
    case 'pending':   return 'Pending'
    case 'failed':    return 'Failed'
    case 'cancelled': return 'Failed'
  }
}

export const paymentService = {
  async initiate(billId: number, token: string, amount: number): Promise<{ checkoutUrl: string; paymentId: number }> {
    const { data } = await api.post<{ checkout_url: string; payment_id: number }>('/api/payments/initiate', {
      bill_id: billId,
      token,
      amount,
    })
    return { checkoutUrl: data.checkout_url, paymentId: data.payment_id }
  },

  async cancelPayment(paymentId: number): Promise<void> {
    await api.post(`/api/payments/${paymentId}/cancel`)
  },

  async getUserPayments(): Promise<PaymentHistoryItem[]> {
    try {
      const { data } = await api.get<RawUserPayment[]>('/api/payments/user')
      return data.map((p) => ({
        paymentId: p.id,
        billId: p.bill_id,
        amount: num(p.amount),
        status: mapPaymentStatus(p.status),
        rawStatus: p.status,
        paidAt: p.paid_at,
        createdAt: p.created_at,
        billTitle: p.bill_title,
        currency: p.currency,
        billToken: p.bill_token,
        merchantName: p.merchant_name,
        contributorsCount: typeof p.contributors_count === 'string'
          ? parseInt(p.contributors_count, 10) || 0
          : p.contributors_count,
      }))
    } catch (err: any) {
      // 404 means no payments yet — return empty list
      if (err?.response?.status === 404) return []
      throw err
    }
  },
}
