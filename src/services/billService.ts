import { api } from './api'
import type { BillDetail, BillItem } from '@/types'

interface RawBill {
  id: number
  title: string
  amount: string | number
  fees: string | number
  currency: string
  items: string | BillItem[]
  status: 'open' | 'paid' | 'completed' | 'expired'
  paid_amount: string | number
  remaining: string | number
  created_at: string
  expires_at: string
  transferred?: boolean
  transfer_id?: string | null
}

function num(v: string | number | undefined | null): number {
  if (v == null) return 0
  return typeof v === 'string' ? parseFloat(v) : v
}

function parseItems(items: string | BillItem[]): BillItem[] {
  if (Array.isArray(items)) return items
  try {
    return JSON.parse(items) as BillItem[]
  } catch {
    return []
  }
}

export const billService = {
  async getBillByToken(billId: number, token: string): Promise<BillDetail> {
    const { data } = await api.get<RawBill>(`/api/bills/${billId}`, { params: { token } })
    return {
      id: data.id,
      title: data.title,
      amount: num(data.amount),
      fees: num(data.fees),
      currency: data.currency,
      items: parseItems(data.items),
      status: data.status,
      paidAmount: num(data.paid_amount),
      remaining: num(data.remaining),
      createdAt: data.created_at,
      expiresAt: data.expires_at,
      token,
    }
  },
}

export function parseBillFromQR(text: string): { billId: number; token: string } | null {
  // Accept full URLs like "https://host/bills/5?token=abc12345"
  // or plain "5:abc12345" / "5/abc12345" formats for manual entry.
  if (!text) return null
  const trimmed = text.trim()
  // Try URL with /bills/<id>?token=...
  try {
    const url = new URL(trimmed)
    const m = url.pathname.match(/bills\/(\d+)/)
    const token = url.searchParams.get('token')
    if (m && token) return { billId: parseInt(m[1], 10), token }
  } catch {
    /* not a URL */
  }
  // Try "id:token" or "id/token"
  const parts = trimmed.split(/[:\/\s]+/).filter(Boolean)
  if (parts.length === 2 && /^\d+$/.test(parts[0])) {
    return { billId: parseInt(parts[0], 10), token: parts[1] }
  }
  return null
}

export function currencySymbol(code: string): string {
  const c = code?.toLowerCase() ?? 'usd'
  if (c === 'gbp') return '£'
  if (c === 'eur') return '€'
  if (c === 'egp') return 'E£'
  return '$'
}

export function mapBillStatus(status: BillDetail['status']): 'Completed' | 'Pending' | 'Expired' {
  if (status === 'paid' || status === 'completed') return 'Completed'
  if (status === 'expired') return 'Expired'
  return 'Pending'
}
